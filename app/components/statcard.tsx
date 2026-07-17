import { LucideIcon } from "lucide-react";

type StatCardProps = {
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    borderColor: string;
    badge: string;
    badgeColor: string;
    value: string;
    label: string;
};

export default function StatCard({ icon: Icon, iconColor, iconBg, borderColor, badge, badgeColor, value, label }: StatCardProps) {
return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${borderColor} p-5 flex-1`}>
        <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
            <Icon size={20} className={iconColor} />
        </div>
        <span className={`text-xs font-sans font-semibold px-2 py-1 rounded-full ${badgeColor}`}>
            {badge}
        </span>
        </div>
        <p className="text-3xl font-sans font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 font-sans">{label}</p>
    </div>
    );
}