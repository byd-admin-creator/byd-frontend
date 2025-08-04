import { useState } from 'react'
import {
  CalendarIcon,
  FireIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

import FixedFunds from './FixedFunds'
import Welfare from './Welfare'
import ActivityFunds from './ActivityFunds'
import Orders from './Orders'

// Define tab data
const tabs = [
  { key: 'fixed', label: 'Fixed Fund', icon: CalendarIcon },
  { key: 'welfare', label: 'Welfare Fund', icon: ClockIcon },
  { key: 'activity', label: 'Activity Fund', icon: FireIcon },
  { key: 'orders', label: 'My Orders', icon: ClipboardDocumentListIcon },
] as const

export default function InvestPage() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['key']>('fixed')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'fixed':
        return <FixedFunds />
      case 'activity':
        return <ActivityFunds />
      case 'welfare':
        return <Welfare />
      case 'orders':
        return <Orders />
      default:
        return null
    }
  }

  return (
    <div className="flex justify-center bg-gray-50 overflow-hidden h-screen">
    <div className="w-screen max-w-[390px] mx-auto flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Fixed Sidebar Navigation */}
      <aside className="w-28 flex flex-col items-center gap-4 p-4 bg-white shadow-md">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex flex-col items-center py-3 px-2 rounded-xl transition-all text-xs font-medium
                ${isActive
                  ? 'bg-gradient-to-br from-red-600 to-black text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-6 w-6 mb-1" />
              {label}
            </button>
          )
        })}
      </aside>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {renderTabContent()}
      </main>
    </div>
    </div>
  )
}
