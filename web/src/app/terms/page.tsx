import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 | BARM',
  description: 'BARM - Be A Real Man の利用規約',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href="/settings"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            &larr; 戻る
          </Link>
          <h1 className="text-lg font-bold">利用規約</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            最終更新日: 2024年1月1日
          </p>

          <h2>第1条（適用）</h2>
          <p>
            本規約は、BARM（以下「本サービス」といいます）の利用に関する条件を定めるものです。
            登録ユーザーの皆様（以下「ユーザー」といいます）には、本規約に従って本サービスをご利用いただきます。
          </p>

          <h2>第2条（サービスの内容）</h2>
          <p>
            本サービスは、ユーザーの習慣形成を支援するためのアプリケーションです。
            主な機能として以下を提供します：
          </p>
          <ul>
            <li>ミッション（目標）の設定と進捗管理</li>
            <li>グループ機能による仲間との習慣共有</li>
            <li>リマインダー通知</li>
          </ul>

          <h2>第3条（登録）</h2>
          <p>
            本サービスの利用を希望する方は、本規約に同意の上、所定の方法により利用登録を行うものとします。
            登録にはメールアドレスまたはSNSアカウントによる認証が必要です。
          </p>

          <h2>第4条（禁止事項）</h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：</p>
          <ul>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーに対する誹謗中傷、脅迫、嫌がらせ</li>
            <li>虚偽の情報を登録する行為</li>
            <li>他のユーザーのアカウントを不正に使用する行為</li>
            <li>本サービスの機能を不正に利用する行為</li>
            <li>当社または第三者の知的財産権を侵害する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>

          <h2>第5条（サービスの停止・変更）</h2>
          <p>
            当社は、以下の場合には、ユーザーに事前に通知することなく、本サービスの全部または一部の提供を停止または中断することができるものとします：
          </p>
          <ul>
            <li>本サービスのシステムの保守点検または更新を行う場合</li>
            <li>地震、落雷、火災、停電または天災などの不可抗力により本サービスの提供が困難となった場合</li>
            <li>その他、当社が本サービスの提供が困難と判断した場合</li>
          </ul>

          <h2>第6条（知的財産権）</h2>
          <p>
            本サービスに関する著作権、商標権その他の知的財産権は、当社または正当な権利を有する第三者に帰属します。
            ユーザーは、これらを無断で使用することはできません。
          </p>

          <h2>第7条（免責事項）</h2>
          <p>
            当社は、本サービスに関してユーザーに生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負わないものとします。
          </p>
          <p>
            当社は、本サービスによってユーザーが得られる効果（習慣形成、健康増進等）について何ら保証するものではありません。
          </p>

          <h2>第8条（利用規約の変更）</h2>
          <p>
            当社は、ユーザーに事前に通知することなく、本規約を変更することができるものとします。
            変更後の利用規約は、本サービス上に掲示した時点から効力を生じるものとします。
          </p>

          <h2>第9条（準拠法・裁判管轄）</h2>
          <p>
            本規約の解釈にあたっては、日本法を準拠法とします。
            本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>

          <h2>お問い合わせ</h2>
          <p>
            本規約に関するお問い合わせは、以下までご連絡ください。
          </p>
          <p>
            メール: support@barm.app
          </p>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          <p>&copy; {new Date().getFullYear()} BARM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
