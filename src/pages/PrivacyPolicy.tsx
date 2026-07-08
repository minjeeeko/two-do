import type { ReactNode } from 'react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/ui'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-[13.5px] font-bold text-ink mb-2">{title}</h2>
      <div className="text-[12.5px] text-ink-2 leading-relaxed space-y-1.5">{children}</div>
    </div>
  )
}

export function PrivacyPolicy() {
  return (
    <div>
      <TopBar title="개인정보 처리방침" back />
      <div className="px-4 pb-10">
        <Card className="p-4 mb-5 bg-brand-soft border-brand/20">
          <p className="text-[12px] text-brand-dark leading-relaxed">
            DOMO는 커플 두 사람만의 공간이에요. 수집하는 정보는 리듬을 함께 만드는 데만 사용하고, 제3자에게 판매하거나
            광고 목적으로 제공하지 않아요.
          </p>
        </Card>

        <Section title="1. 수집하는 정보">
          <p>· 계정 정보: 닉네임, 관심사 카테고리</p>
          <p>· 활동 정보: 미션, 인증 기록(체크/메모/사진), 이모지 반응, 격려 메시지</p>
          <p>· 기기 정보: 알림 수신을 위한 푸시 토큰(알림을 켠 경우에 한함)</p>
        </Section>

        <Section title="2. 이용 목적">
          <p>· 커플 간 미션·인증·응원 기능 제공</p>
          <p>· 잔디, streak, 뱃지 등 성취 시각화 계산</p>
          <p>· 서비스 품질 개선을 위한 최소한의 통계 분석</p>
        </Section>

        <Section title="3. 공개 범위와 상대방 접근">
          <p>· 기본값은 '요약 공유'로, 상대는 달성 여부와 한 줄 메모만 볼 수 있어요.</p>
          <p>· '상세 공유'를 선택한 경우에만 사진과 긴 메모가 상대에게 노출돼요.</p>
          <p>· '비공개'로 설정한 기록은 본인만 볼 수 있어요.</p>
        </Section>

        <Section title="4. 보유 기간">
          <p>· 서비스 이용 기간 동안 보관하며, 삭제를 요청하면 지체 없이 파기해요.</p>
          <p>· 커플 연결을 해제해도 개인 기록은 본인 계정에 남아있어요.</p>
        </Section>

        <Section title="5. 제3자 제공">
          <p>· 원칙적으로 제3자에게 제공하지 않아요.</p>
          <p>· 법령에 따라 요구되는 경우에 한해 최소한의 범위로 제공될 수 있어요.</p>
        </Section>

        <Section title="6. 이용자의 권리">
          <p>· 언제든지 내 데이터를 내보내거나(JSON) 삭제를 요청할 수 있어요.</p>
          <p>· 공개 범위와 알림 설정은 마이 탭에서 직접 관리할 수 있어요.</p>
        </Section>

        <p className="text-[11px] text-ink-faint mt-6">이 화면은 데모용 안내이며, 실제 서비스 출시 시 법무 검토를 거친 최종 약관으로 대체돼요.</p>
      </div>
    </div>
  )
}
