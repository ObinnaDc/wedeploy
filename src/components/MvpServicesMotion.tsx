import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const services = [
  {
    title: 'SaaS Platforms',
    text: 'Build & launch your software-as-a-service idea as a fully functional product. Our experts build scalable solutions across industries, from sales to wellness.',
    icon: 'assets/icon-saas.svg',
  },
  {
    title: 'Marketplaces',
    text: "We bring your marketplace vision to life effortlessly. Whether it's e-commerce, rentals, or services, we'll build the perfect marketplace for your business.",
    icon: 'assets/icon-marketplace.svg',
  },
  {
    title: 'Internal Tools',
    text: "Enhance your team's efficiency with tailor-made internal tools, be it a collaborative project management system or a data reporting dashboard.",
    icon: 'assets/icon-tools.svg',
  },
  {
    title: 'And more',
    text: "Don't let coding limitations hold you back. Our no-code developers transform your app ideas into powerful digital solutions, from brainstorming to launch.",
    icon: 'assets/icon-more.svg',
  },
];

export default function MvpServicesMotion({ base }: { base: string }) {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? {} : { opacity: 0, y: 22 };

  return (
    <section className="bg-[#fbfbfc] py-[86px]">
      <div className="mx-auto grid max-w-[1120px] gap-10 px-6 lg:grid-cols-[0.92fr_1.55fr] xl:px-0">
        <motion.div
          className="max-w-[390px]"
          initial={enter}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-[40px] font-normal leading-[1.05] max-[770px]:text-[28px] max-[770px]:leading-[28px]">From MVPs to full fledged web apps</h2>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#4b5058]">
            Our no-code developers can help you build your app and take it from idea to prototype to MVP and beyond.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.09 } },
          }}
        >
          {services.map((service) => (
            <motion.article
              key={service.title}
              className="min-h-[188px] rounded-[8px] border border-deploy-line bg-white p-6 shadow-soft"
              variants={{
                hidden: reduceMotion ? {} : { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? {} : { y: -4, boxShadow: '0 14px 32px rgba(18, 31, 53, 0.09)' }}
            >
              <div className="flex items-start gap-5">
                <img src={`${base}${service.icon}`} alt="" className="mt-1 h-7 w-7" loading="lazy" />
                <div>
                  <h3 className="text-[24px] font-normal leading-tight text-[#424850]">{service.title}</h3>
                  <p className="mt-3 text-[16px] leading-[1.45] text-[#4d535b]">{service.text}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
