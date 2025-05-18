import React from 'react'
import Image from 'next/image'

const Logo = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/dark-mode-logo.png"
            alt="Company Logo"
            style={{ maxHeight: '80px', padding: '10px 0' }} />
  </div>
)

export default Logo
