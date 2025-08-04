import React from 'react';
import { Phone, MessageCircle, Clock, Mail, MapPin } from 'lucide-react';

export default function CustomerSupport() {
  const supportOptions = [
    {
      title: 'Telegram Support',
      subtitle: 't.me/byd_management',
      description: 'Preferred channel - instant response',
      icon: <MessageCircle className="h-5 w-5 text-white" />,
      action: 'https://t.me/byd_management',
      priority: 'high'
    },
    {
      title: 'Call Us',
      subtitle: '+234 805 002 0121',
      description: 'Available 24/7 for urgent matters',
      icon: <Phone className="h-5 w-5 text-white" />,
      action: 'tel:+2341234567',
      priority: 'medium'
    },
    {
      title: 'Email Support',
      subtitle: 'support@bydmanagement.com',
      description: 'Detailed inquiries and documentation',
      icon: <Mail className="h-5 w-5 text-white" />,
      action: 'mailto:bydautomanagement@gmail.com',
      priority: 'low'
    }
  ];

  const businessHours = {
    weekdays: '9:00 AM - 6:00 PM',
    weekend: '10:00 AM - 4:00 PM',
    timezone: 'WAT (West Africa Time)'
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: '390px' }}>
      {/* Header Section */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-black px-6 py-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Customer Support</h1>
          <p className="text-red-100 text-sm font-medium">We're here to help you.</p>
        </div>
      </div>

      {/* Support Options */}
      <div className="p-6 space-y-4">
        {supportOptions.map(({ title, subtitle, description, icon, action, priority }) => (
          <a
            key={title}
            href={action}
            target={action.startsWith('http') ? '_blank' : undefined}
            rel={action.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group block bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all duration-200 border border-gray-200 hover:border-red-200 hover:shadow-md"
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className={`p-2.5 rounded-lg bg-gradient-to-br from-red-600 to-black flex-shrink-0 group-hover:scale-105 transition-transform duration-200 ${
                priority === 'high' ? 'ring-2 ring-red-200' : ''
              }`}>
                {icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-red-700 transition-colors">
                    {title}
                  </h3>
                  {priority === 'high' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Priority
                    </span>
                  )}
                </div>
                <p className="text-red-600 font-medium text-sm mb-1 truncate">{subtitle}</p>
                <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Business Hours */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-800 text-sm">Business Hours</h4>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Monday - Friday:</span>
            <span className="font-medium">{businessHours.weekdays}</span>
          </div>
          <div className="flex justify-between">
            <span>Weekend:</span>
            <span className="font-medium">{businessHours.weekend}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-200">
            <span>Timezone:</span>
            <span className="font-medium">{businessHours.timezone}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-black">
        <div className="flex items-center space-x-2 text-white">
          <MapPin className="h-4 w-4 text-gray-300" />
          <p className="text-xs text-gray-300">
            Lagos, Nigeria • Serving Africa & Beyond
          </p>
        </div>
      </div>
    </div>
  );
}