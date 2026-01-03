import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | BARM',
  description: 'BARM - Be A Real Man のプライバシーポリシー',
}

export default function PrivacyPage() {
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
          <h1 className="text-lg font-bold">プライバシーポリシー</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            最終更新日: 2024年1月1日
          </p>

          <p>
            BARM（以下「本サービス」といいます）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
            本プライバシーポリシーは、本サービスが収集する情報の種類、その利用方法、およびお客様の選択について説明します。
          </p>

          <h2>1. 収集する情報</h2>
          <p>本サービスは、以下の情報を収集します：</p>

          <h3>1.1 アカウント情報</h3>
          <ul>
            <li>メールアドレス</li>
            <li>ニックネーム（表示名）</li>
            <li>認証に使用するSNSアカウント情報（Google、Appleなど）</li>
          </ul>

          <h3>1.2 利用データ</h3>
          <ul>
            <li>ミッション（目標）の設定内容</li>
            <li>ミッションの達成記録</li>
            <li>グループへの参加情報</li>
            <li>アプリの利用履歴</li>
          </ul>

          <h3>1.3 デバイス情報</h3>
          <ul>
            <li>デバイスの種類、OS</li>
            <li>プッシュ通知用トークン</li>
            <li>IPアドレス</li>
          </ul>

          <h2>2. 情報の利用目的</h2>
          <p>収集した情報は、以下の目的で利用します：</p>
          <ul>
            <li>本サービスの提供および運営</li>
            <li>ユーザーアカウントの管理</li>
            <li>ユーザーサポートの提供</li>
            <li>サービスの改善および新機能の開発</li>
            <li>リマインダー通知の送信</li>
            <li>統計データの作成（個人を特定しない形式）</li>
          </ul>

          <h2>3. 第三者サービスとの情報共有</h2>
          <p>本サービスは、以下の第三者サービスを利用しており、必要な情報を共有する場合があります：</p>

          <h3>3.1 Firebase (Google)</h3>
          <ul>
            <li>Firebase Authentication: ユーザー認証</li>
            <li>Cloud Firestore: データの保存</li>
            <li>Firebase Cloud Messaging: プッシュ通知の送信</li>
          </ul>
          <p>
            Googleのプライバシーポリシー:{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              https://policies.google.com/privacy
            </a>
          </p>

          <h3>3.2 RevenueCat</h3>
          <p>
            サブスクリプションおよびアプリ内課金の管理に使用します。
            購入履歴および関連するアカウント情報を共有する場合があります。
          </p>
          <p>
            RevenueCatのプライバシーポリシー:{' '}
            <a
              href="https://www.revenuecat.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              https://www.revenuecat.com/privacy
            </a>
          </p>

          <h2>4. データの保管</h2>
          <p>
            お客様のデータは、適切なセキュリティ対策を施したサーバーに保管されます。
            データは、サービス提供に必要な期間、またはお客様がアカウントを削除するまで保管されます。
          </p>

          <h2>5. ユーザーの権利</h2>
          <p>ユーザーは以下の権利を有します：</p>
          <ul>
            <li>
              <strong>アクセス権:</strong> ご自身の個人情報へのアクセスを要求する権利
            </li>
            <li>
              <strong>訂正権:</strong> 不正確な個人情報の訂正を要求する権利
            </li>
            <li>
              <strong>削除権:</strong> 個人情報の削除を要求する権利
            </li>
            <li>
              <strong>データポータビリティ:</strong> ご自身のデータのコピーを要求する権利
            </li>
          </ul>
          <p>
            これらの権利を行使するには、下記のお問い合わせ先までご連絡ください。
          </p>

          <h2>6. Cookie</h2>
          <p>
            本サービスは、ユーザー体験の向上およびサービスの分析のためにCookieを使用する場合があります。
            ブラウザの設定でCookieを無効にすることができますが、一部の機能が利用できなくなる場合があります。
          </p>

          <h2>7. 子どものプライバシー</h2>
          <p>
            本サービスは13歳未満の方を対象としていません。
            13歳未満のお子様の個人情報を意図的に収集することはありません。
            13歳未満のお子様がアカウントを作成した場合は、速やかにお知らせください。
          </p>

          <h2>8. プライバシーポリシーの変更</h2>
          <p>
            本プライバシーポリシーは、必要に応じて更新される場合があります。
            重要な変更がある場合は、本サービス内でお知らせします。
            変更後も本サービスを継続して利用することにより、変更後のプライバシーポリシーに同意したものとみなされます。
          </p>

          <h2>9. お問い合わせ</h2>
          <p>
            本プライバシーポリシーに関するご質問やご要望は、以下までご連絡ください：
          </p>
          <p>
            <strong>メール:</strong> support@barm.app
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
