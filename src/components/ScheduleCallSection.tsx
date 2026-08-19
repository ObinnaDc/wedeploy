import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

export default function ScheduleCallSection() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();

      cal('ui', {
        theme: 'light',
        styles: {
          branding: {
            brandColor: '#0877E8',
          },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);

  return (
    <section className="bg-white py-[86px] max-[770px]:py-16">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 md:px-10 lg:grid-cols-[minmax(0,484px)_minmax(0,680px)] lg:items-start lg:justify-between lg:gap-12 lg:px-[72px]">
        <div className="max-w-[484px]">
          <h2 className="text-[32px] font-bold leading-[1.12] text-[#101828]">Schedule a Call with Us</h2>
          <p className="mt-4 text-[16px] font-normal leading-[1.7] text-[#667085]">
            In our discovery call, we&apos;ll have a quick conversation about your project to understand your goals and
            see if we&apos;re a good fit.
          </p>
          <p className="mt-4 text-[16px] font-normal leading-[1.7] text-[#667085]">
            This call is completely free and helps us get to know you better. Book your call now, and let&apos;s get
            started!
          </p>
        </div>

        <div className="relative w-full lg:max-w-[680px]">
          <span className="absolute right-[8px] top-[2px] z-10 inline-flex h-[40px] w-[120px] rotate-[6.95deg] items-center justify-center rounded-full bg-[#0877E8] px-[10px] py-[10px] text-[14px] font-medium leading-none text-white shadow-[0_10px_25px_rgba(8,119,232,0.16)] max-[770px]:right-2 max-[770px]:top-3">
            Totally free {'\u2728'}
          </span>

          <div className="relative overflow-hidden rounded-[22px] border border-[#EAECF0] bg-white p-[20px] shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[61.8%] top-[76px] hidden w-px bg-[#EAECF0] lg:block"
              style={{ height: '266px' }}
            />

            <div className="schedule-call-embed w-full">
              <Cal
                calLink="deploystudio/discovery-call"
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'scroll',
                }}
                config={{
                  layout: 'month_view',
                  theme: 'light',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .schedule-call-embed {
          min-height: 760px;
        }

        .schedule-call-embed iframe {
          width: 100% !important;
          min-height: 760px !important;
          border: 0;
        }

        @media (min-width: 1025px) {
          .schedule-call-embed {
            min-height: 640px;
          }

          .schedule-call-embed iframe {
            min-height: 640px !important;
          }
        }
      `}</style>
    </section>
  );
}
