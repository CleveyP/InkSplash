import Image from 'next/image'
import styles from './page.module.css'
import { ChatBar } from '@/component/chatbar/ChatBar'

export default function Home() {
  return (
    <div>

      <h1>INK SPLASH</h1>
      <ChatBar />

    </div>


  )
}
