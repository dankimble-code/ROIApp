import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function createTemporaryPassword(length = 16) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Supabase environment variables are not configured for this function.')
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser()

    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: 'Unable to identify the current admin user.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: isAdmin, error: adminCheckError } = await adminClient.rpc('has_role', {
      _user_id: caller.id,
      _role: 'admin',
    })

    if (adminCheckError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access is required for this action.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { accessRequestId } = await request.json()
    if (!accessRequestId) {
      return new Response(JSON.stringify({ error: 'accessRequestId is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: accessRequest, error: accessRequestError } = await adminClient
      .from('access_requests')
      .select('*')
      .eq('id', accessRequestId)
      .single()

    if (accessRequestError || !accessRequest) {
      return new Response(JSON.stringify({ error: 'Access request not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (accessRequest.status === 'rejected') {
      return new Response(JSON.stringify({ error: 'Rejected requests cannot be provisioned.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const normalizedEmail = accessRequest.email.trim().toLowerCase()
    const temporaryPassword = createTemporaryPassword()

    const { data: existingProfile } = await adminClient
      .from('user_profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    let userId = existingProfile?.id ?? null
    const isExistingUser = Boolean(existingProfile?.id)

    if (userId) {
      const { error: updateUserError } = await adminClient.auth.admin.updateUserById(userId, {
        email: normalizedEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: accessRequest.full_name,
          company: accessRequest.company,
        },
        app_metadata: {
          requires_password_reset: true,
          provisioned_by_admin: true,
        },
      })

      if (updateUserError) {
        throw updateUserError
      }
    } else {
      const { data: createdUserResponse, error: createUserError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: accessRequest.full_name,
          company: accessRequest.company,
        },
        app_metadata: {
          requires_password_reset: true,
          provisioned_by_admin: true,
        },
      })

      if (createUserError || !createdUserResponse.user) {
        throw createUserError ?? new Error('Unable to create auth user.')
      }

      userId = createdUserResponse.user.id
    }

    const appOrigin = request.headers.get('origin') || 'https://coach-value-insight.vercel.app'
    const resetRedirectTo = `${appOrigin.replace(/\/$/, '')}/reset-password`

    const { data: resetLinkResponse, error: resetLinkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: resetRedirectTo,
      },
    })

    if (resetLinkError) {
      throw resetLinkError
    }

    const existingNotes = accessRequest.review_notes ? `${accessRequest.review_notes}\n` : ''
    const provisioningNote = `Temporary password generated ${new Date().toISOString()} by ${caller.email ?? caller.id}.`

    const { error: requestUpdateError } = await adminClient
      .from('access_requests')
      .update({
        status: 'invited',
        review_notes: `${existingNotes}${provisioningNote}`.trim(),
      })
      .eq('id', accessRequest.id)

    if (requestUpdateError) {
      throw requestUpdateError
    }

    return new Response(
      JSON.stringify({
        email: normalizedEmail,
        temporaryPassword,
        resetLink: resetLinkResponse.properties?.action_link ?? null,
        isExistingUser,
        userId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected provisioning error.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
