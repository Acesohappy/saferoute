import { Lightbulb, Users, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SafetyTips() {
  const tips = [
    {
      icon: Lightbulb,
      title: "Stay Alert",
      description: "Keep your phone charged and share your location with trusted contacts",
      color: "text-warning-orange",
    },
    {
      icon: Users,
      title: "Stay in Groups",
      description: "Travel with others when possible, especially during late hours",
      color: "text-safe-green",
    },
    {
      icon: Phone,
      title: "Emergency Contacts",
      description: "Keep emergency numbers handy and use panic button if needed",
      color: "text-trust-blue",
    },
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-text">
          Safety Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start">
              <tip.icon className={`${tip.color} mt-1 mr-3 h-5 w-5`} />
              <div>
                <p className="text-sm font-medium text-neutral-text">{tip.title}</p>
                <p className="text-xs text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
