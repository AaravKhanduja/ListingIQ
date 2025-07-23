"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Search, HelpCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: "Key Strengths",
    description: "Identify what makes this property a great investment opportunity",
    bgColor: "from-blue-50 to-white",
    borderColor: "border-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    icon: AlertTriangle,
    title: "Potential Risks",
    description: "Understand possible concerns and red flags before you buy",
    bgColor: "from-orange-50 to-white",
    borderColor: "border-orange-100",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600"
  },
  {
    icon: Search,
    title: "Hidden Issues",
    description: "Discover critical problems that listings don't disclose",
    bgColor: "from-red-50 to-white",
    borderColor: "border-red-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-600"
  },
  {
    icon: HelpCircle,
    title: "Smart Questions",
    description: "Get the right questions to ask sellers and agents",
    bgColor: "from-indigo-50 to-white",
    borderColor: "border-indigo-100",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600"
  }
];

export function HowItWorks() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <Card 
            key={index}
            className={`border ${feature.borderColor} bg-gradient-to-br ${feature.bgColor} hover:shadow-lg transition-shadow`}
          >
            <CardContent className="pt-6 pb-6">
              <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <IconComponent className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-base font-semibold text-black mb-2">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}