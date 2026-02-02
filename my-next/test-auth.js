// Test authentication script
require('dotenv').config()

const baseUrl = 'http://localhost:3000'

async function testAuth() {
  console.log('🧪 Testing Authentication System\n')

  try {
    // Test 1: Login with admin credentials
    console.log('1️⃣  Testing Admin Login...')
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@railway.com',
        password: 'admin123',
      }),
    })

    if (!loginResponse.ok) {
      console.log('❌ Login failed')
      const error = await loginResponse.json()
      console.log('   Error:', error)
      return
    }

    const loginData = await loginResponse.json()
    console.log('✅ Login successful!')
    console.log(`   User: ${loginData.user.name} (${loginData.user.role})`)
    console.log(`   Token: ${loginData.token.substring(0, 20)}...`)

    const token = loginData.token

    // Test 2: Get user profile
    console.log('\n2️⃣  Testing Profile Fetch...')
    const profileResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (profileResponse.ok) {
      const profileData = await profileResponse.json()
      console.log('✅ Profile fetched successfully!')
      console.log(`   Name: ${profileData.user.name}`)
      console.log(`   Email: ${profileData.user.email}`)
    } else {
      console.log('❌ Profile fetch failed')
    }

    // Test 3: Access admin-only endpoint
    console.log('\n3️⃣  Testing Admin-Only Endpoint...')
    const usersResponse = await fetch(`${baseUrl}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (usersResponse.ok) {
      const usersData = await usersResponse.json()
      console.log('✅ Admin endpoint accessible!')
      console.log(`   Total users: ${usersData.users.length}`)
    } else {
      console.log('❌ Admin endpoint failed')
    }

    // Test 4: Test with invalid token
    console.log('\n4️⃣  Testing Invalid Token...')
    const invalidResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    })

    if (invalidResponse.status === 401) {
      console.log('✅ Invalid token correctly rejected!')
    } else {
      console.log('❌ Invalid token should be rejected')
    }

    // Test 5: Login with kitchen user and try admin endpoint
    console.log('\n5️⃣  Testing Role-Based Access Control...')
    const kitchenLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'kitchen@railway.com',
        password: 'kitchen123',
      }),
    })

    if (kitchenLogin.ok) {
      const kitchenData = await kitchenLogin.json()
      const kitchenToken = kitchenData.token

      const adminAccessResponse = await fetch(`${baseUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${kitchenToken}`,
        },
      })

      if (adminAccessResponse.status === 403) {
        console.log('✅ Kitchen user correctly denied admin access!')
      } else {
        console.log('❌ Kitchen user should not access admin endpoint')
      }
    }

    console.log('\n🎉 All authentication tests completed!')

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    console.log('\n💡 Make sure the Next.js dev server is running:')
    console.log('   npm run dev')
  }
}

// Check if server is running
console.log('⚠️  Make sure your Next.js dev server is running on port 3000')
console.log('   Run: npm run dev')
console.log('\nStarting tests in 2 seconds...\n')

setTimeout(testAuth, 2000)
