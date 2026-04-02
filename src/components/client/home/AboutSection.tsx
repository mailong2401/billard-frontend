'use client';

import { BiTrophy, BiMedal, BiDiamond, BiStar, BiCheckShield, BiHeart } from 'react-icons/bi';
import Image from 'next/image';

export default function AboutSection() {
  const features = [
    {
      icon: BiTrophy,
      title: 'Đẳng cấp chuyên nghiệp',
      description: 'Bàn bi da đạt tiêu chuẩn quốc tế, được bảo trì thường xuyên',
      color: 'text-yellow-500'
    },
    {
      icon: BiMedal,
      title: 'Giải đấu hấp dẫn',
      description: 'Tổ chức các giải đấu hàng tuần với giải thưởng lớn',
      color: 'text-orange-500'
    },
    {
      icon: BiDiamond,
      title: 'Không gian sang trọng',
      description: 'Thiết kế hiện đại, ánh sáng chuyên nghiệp, máy lạnh',
      color: 'text-blue-500'
    },
    {
      icon: BiStar,
      title: 'Dịch vụ đẳng cấp',
      description: 'Phục vụ tận tâm, đồ uống đa dạng, giá cả hợp lý',
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-macchiato-text mb-4">
          Về <span className="text-primary-600">Billiard Club</span>
        </h2>
        <p className="text-gray-600 dark:text-macchiato-subtext max-w-2xl mx-auto">
          Nơi hội tụ của những cơ thủ chuyên nghiệp và đam mê bộ môn bi da
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-macchiato-surface rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-macchiato-subtext">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thống kê ấn tượng */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">10+</div>
            <div className="text-sm text-primary-100">Năm kinh nghiệm</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
            <div className="text-sm text-primary-100">Giải đấu tổ chức</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">1000+</div>
            <div className="text-sm text-primary-100">Khách hàng hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">20+</div>
            <div className="text-sm text-primary-100">Bàn đạt chuẩn</div>
          </div>
        </div>
      </div>
    </div>
  );
}
