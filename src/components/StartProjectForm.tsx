import Cal, { getCalApi } from '@calcom/embed-react';
import React, { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const STEP_LABELS = ['Project type', 'Budget range', 'Timeline', 'Details'] as const;
const PROJECT_TYPES = [
  'Web app',
  'Mobile app',
  'SaaS platform',
  'API / integrations',
  'Technical discovery',
  'Bubble migration',
  'Something else',
] as const;
const BUDGET_RANGES = ['Under \u20ac10k', '\u20ac10k \u2013 \u20ac30k', '\u20ac30k \u2013 \u20ac80k', '\u20ac80k+', 'Not sure yet'] as const;
const TIMELINES = ['ASAP', '1\u20133 months', '3\u20136 months', '6+ months', 'Just exploring'] as const;

type StepIndex = 0 | 1 | 2 | 3;
type ViewMode = 'message' | 'call';

type FormState = {
  projectType: string;
  budgetRange: string;
  timeline: string;
  fullName: string;
  email: string;
  company: string;
  details: string;
};

const INITIAL_STATE: FormState = {
  projectType: '',
  budgetRange: '',
  timeline: '',
  fullName: '',
  email: '',
  company: '',
  details: '',
};

function ArrowLongLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ArrowLongRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function createMailtoBody(state: FormState) {
  return [
    'New project inquiry',
    '',
    `Project type: ${state.projectType}`,
    `Budget range: ${state.budgetRange}`,
    `Timeline: ${state.timeline}`,
    `Full name: ${state.fullName}`,
    `Email: ${state.email}`,
    `Company: ${state.company || 'N/A'}`,
    '',
    'Project details:',
    state.details,
  ].join('\n');
}

function Progress({ step }: { step: StepIndex }) {
  return (
    <div className="flex items-center gap-[8px]">
      {STEP_LABELS.map((label, index) => (
        <React.Fragment key={label}>
          <span className={`block h-[4px] w-[30px] rounded-full ${index <= step ? 'bg-deploy-blue' : 'bg-[#d9dde4]'}`} />
          {index === step ? (
            <span className="text-[14px] font-semibold leading-none text-deploy-navy">{label}</span>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[46px] w-full items-center rounded-[16px] border px-6 text-left text-[16px] font-normal leading-none transition ${
        selected
          ? 'border-[#bfdcff] bg-[#eef6ff] text-deploy-navy shadow-[0_8px_22px_rgba(8,119,232,0.08)]'
          : 'border-[#e5e7eb] bg-white text-black hover:border-[#cad3df] hover:bg-[#fbfcfe]'
      }`}
    >
      {label}
    </button>
  );
}

function ContactCalEmbed() {
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
    <div className="overflow-hidden rounded-[20px] border border-[#e6e8ee] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.04)]">
      <div className="contact-cal-embed w-full">
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
  );
}

export default function StartProjectForm() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = React.useState<StepIndex>(0);
  const [mode, setMode] = React.useState<ViewMode>('message');
  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<Partial<Record<'fullName' | 'email' | 'details', string>>>({});
  const [submitState, setSubmitState] = React.useState<'idle' | 'ready'>('idle');

  const setField = <K extends keyof FormState,>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const goToNext = (key: 'projectType' | 'budgetRange' | 'timeline', value: string, nextStep: StepIndex) => {
    setField(key, value);
    setStep(nextStep);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<'fullName' | 'email' | 'details', string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.details.trim()) nextErrors.details = 'Tell us more is required.';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const subject = encodeURIComponent(`New project inquiry from ${form.fullName}`);
    const body = encodeURIComponent(createMailtoBody(form));
    window.location.href = `mailto:dcobinna@gmail.com?subject=${subject}&body=${body}`;
    setSubmitState('ready');
  };

  const variants = {
    initial: reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 },
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="project-type" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="text-[28px] font-bold leading-[1.1] text-black">Project type</h2>
            <div className="mt-4 space-y-3">
              {PROJECT_TYPES.map((option) => (
                <OptionButton key={option} label={option} selected={form.projectType === option} onClick={() => goToNext('projectType', option, 1)} />
              ))}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="budget-range" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="text-[28px] font-bold leading-[1.1] text-black">Budget range</h2>
            <div className="mt-4 space-y-3">
              {BUDGET_RANGES.map((option) => (
                <OptionButton key={option} label={option} selected={form.budgetRange === option} onClick={() => goToNext('budgetRange', option, 2)} />
              ))}
            </div>
            <button type="button" onClick={() => setStep(0)} className="mt-5 inline-flex items-center gap-2 text-[16px] font-normal text-[#98a2b3] transition hover:text-deploy-navy">
              <ArrowLongLeftIcon />
              <span>Back</span>
            </button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="timeline" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="text-[28px] font-bold leading-[1.1] text-black">Timeline</h2>
            <div className="mt-4 space-y-3">
              {TIMELINES.map((option) => (
                <OptionButton key={option} label={option} selected={form.timeline === option} onClick={() => goToNext('timeline', option, 3)} />
              ))}
            </div>
            <button type="button" onClick={() => setStep(1)} className="mt-5 inline-flex items-center gap-2 text-[16px] font-normal text-[#98a2b3] transition hover:text-deploy-navy">
              <ArrowLongLeftIcon />
              <span>Back</span>
            </button>
          </motion.div>
        );
      case 3:
        return (
          <motion.form key="details" onSubmit={handleSubmit} variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex min-h-[50px] items-center rounded-[20px] border border-[#e6e8ee] bg-white px-5 py-3">
              <div className="flex flex-wrap gap-3">
                {[form.projectType, form.budgetRange, form.timeline].map((item) => (
                  <span key={item} className="inline-flex h-[30px] items-center rounded-full bg-[#eef6ff] px-4 text-[14px] font-semibold leading-none text-deploy-navy">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-[16px] font-medium leading-none text-[#303746]">Full name</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  placeholder="Jane Smith"
                  className="mt-[6px] h-[48px] w-full rounded-[18px] border border-[#d9dde4] px-5 text-[18px] text-[#111827] outline-none transition placeholder:text-[#c0c5cf] focus:border-deploy-blue focus:ring-2 focus:ring-deploy-blue/10"
                />
                {errors.fullName ? <p className="mt-2 text-[13px] text-[#c2410c]">{errors.fullName}</p> : null}
              </label>

              <label className="block">
                <span className="text-[16px] font-medium leading-none text-[#303746]">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setField('email', event.target.value)}
                  placeholder="jane@company.com"
                  className="mt-[6px] h-[48px] w-full rounded-[18px] border border-[#d9dde4] px-5 text-[18px] text-[#111827] outline-none transition placeholder:text-[#c0c5cf] focus:border-deploy-blue focus:ring-2 focus:ring-deploy-blue/10"
                />
                {errors.email ? <p className="mt-2 text-[13px] text-[#c2410c]">{errors.email}</p> : null}
              </label>

              <label className="block">
                <span className="text-[16px] font-medium leading-none text-[#303746]">Company (optional)</span>
                <input
                  type="text"
                  value={form.company}
                  onChange={(event) => setField('company', event.target.value)}
                  placeholder="Acme Inc."
                  className="mt-[6px] h-[48px] w-full rounded-[18px] border border-[#d9dde4] px-5 text-[18px] text-[#111827] outline-none transition placeholder:text-[#c0c5cf] focus:border-deploy-blue focus:ring-2 focus:ring-deploy-blue/10"
                />
              </label>

              <label className="block">
                <span className="text-[16px] font-medium leading-none text-[#303746]">Tell us more</span>
                <textarea
                  value={form.details}
                  onChange={(event) => setField('details', event.target.value)}
                  placeholder="What are you building?"
                  rows={4}
                  className="mt-[6px] h-[100px] w-full resize-none rounded-[18px] border border-[#d9dde4] px-5 py-4 text-[18px] text-[#111827] outline-none transition placeholder:text-[#c0c5cf] focus:border-deploy-blue focus:ring-2 focus:ring-deploy-blue/10"
                />
                {errors.details ? <p className="mt-2 text-[13px] text-[#c2410c]">{errors.details}</p> : null}
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => setStep(2)} className="inline-flex h-[60px] items-center justify-center gap-2 rounded-full bg-[#f3f4f6] px-8 text-[18px] font-normal text-[#4b5563] transition hover:bg-[#e8ebf0] hover:text-deploy-navy">
                <ArrowLongLeftIcon />
                <span>Back</span>
              </button>
              <button type="submit" className="inline-flex h-[60px] flex-1 items-center justify-center gap-2 rounded-full bg-deploy-navy px-8 text-[18px] font-bold text-white transition hover:bg-deploy-blue sm:max-w-[280px]">
                <span>Send</span>
                <ArrowLongRightIcon />
              </button>
            </div>

            {submitState === 'ready' ? <p className="mt-4 text-[14px] text-[#667085]">Your email client should open with the project brief prefilled.</p> : null}
          </motion.form>
        );
    }
  };

  return (
    <section className="mx-auto max-w-[1020px] px-6 pb-[86px] pt-[72px] xl:px-0">
      <div className="grid justify-between gap-12 lg:grid-cols-[470px_470px] lg:gap-20">
        <div className="max-w-[470px] pt-1">
          <p className="text-[14px] font-bold uppercase tracking-[0.08em] text-deploy-blue">CONTACT</p>
          <h1 className="mt-[10px] text-[44px] font-bold leading-[1] tracking-[-0.06em] text-black sm:text-[52px] lg:text-[60px] lg:leading-[63px]">
            Start a project
          </h1>
          <p className="mt-[20px] text-[14px] font-normal leading-[2] text-[#4b5563] sm:text-[16px] sm:leading-[1.75]">
            Tell us what you&apos;re building. We respond within 24 hours — direct answer, no runaround.
          </p>

          <div className="mt-[32px] inline-flex rounded-full bg-[#f2f4f7] p-[4px]">
            <button
              type="button"
              onClick={() => setMode('message')}
              className={`inline-flex h-[44px] items-center rounded-full px-7 text-[16px] font-bold transition ${
                mode === 'message' ? 'bg-white text-black shadow-[0_6px_18px_rgba(16,24,40,0.10)]' : 'text-[#7b8695] hover:text-deploy-navy'
              }`}
            >
              <span aria-hidden="true">&#9993;</span>
              <span className="ml-2">Message</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('call')}
              className={`inline-flex h-[44px] items-center rounded-full px-7 text-[16px] font-bold transition ${
                mode === 'call' ? 'bg-white text-black shadow-[0_6px_18px_rgba(16,24,40,0.10)]' : 'text-[#7b8695] hover:text-deploy-navy'
              }`}
            >
              <span aria-hidden="true">&#128197;</span>
              <span className="ml-2">Book a call</span>
            </button>
          </div>

          <div className="mt-[36px] space-y-[20px]">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">EMAIL</p>
              <p className="mt-1 text-[16px] font-medium text-deploy-navy">dcobinna@gmail.com</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">RESPONSE TIME</p>
              <p className="mt-1 text-[16px] font-medium text-deploy-navy">Under 24 hours</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[470px] pt-2">
          {mode === 'message' ? (
            <>
              <Progress step={step} />
              <div className="mt-[28px]">
                <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
              </div>
            </>
          ) : (
            <ContactCalEmbed />
          )}
        </div>
      </div>

      <style>{`
        .contact-cal-embed {
          min-height: 760px;
        }

        .contact-cal-embed iframe {
          width: 100% !important;
          min-height: 760px !important;
          border: 0;
        }
      `}</style>
    </section>
  );
}
