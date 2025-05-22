'use client'

import React from 'react'
import { BiLogoTwitter, BiLogoFacebook, BiLogoYoutube, BiLogoTiktok } from 'react-icons/bi'

const SocialIcons: React.FC = () => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <a
        href="https://youtube.com/@dawanafrica?si=MeDNmWJDGkFWiF45"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-[#2aaac6] transition-colors"
      >
        <BiLogoYoutube size={16} />
      </a>
      <a
        href="https://x.com/dawanafrica?s=11&t=cGgYbc_v8C1zcdmiZHSiRg"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-[#2aaac6] transition-colors"
      >
        <BiLogoTwitter size={16} />
      </a>
      <a
        href="https://www.facebook.com/share/1DLeMnVa2e/?mibextid=wwXIfr"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-[#2aaac6] transition-colors"
      >
        <BiLogoFacebook size={16} />
      </a>
      <a
        href="https://www.tiktok.com/@dawanafrica?_t=ZS-8wXUI4l8QKX&_r=1"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-[#2aaac6] transition-colors"
      >
        <BiLogoTiktok size={16} />
      </a>
    </div>
  )
}

export default SocialIcons
