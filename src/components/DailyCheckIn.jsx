import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { dailyCheckInQuestions, analyzeDailyCheckIn } from '../utils/journalQuestions';

export default function DailyCheckIn({ onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [responses, setResponses] = useState({});
    const [selectedOptions, setSelectedOptions] = useState([]);

    const question = dailyCheckInQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / dailyCheckInQuestions.length) * 100;
    const isLastQuestion = currentQuestion === dailyCheckInQuestions.length - 1;

    const handleSelectOption = (option) => {
        if (question.type === 'single') {
            setResponses(prev => ({ ...prev, [question.id]: option.value }));
            setSelectedOptions([option.value]);
        } else {
            // Multiple select
            const isSelected = selectedOptions.includes(option.value);
            let newSelected;

            if (option.value === 0) {
                // "None" option
                newSelected = [0];
            } else {
                newSelected = isSelected
                    ? selectedOptions.filter(v => v !== option.value)
                    : [...selectedOptions.filter(v => v !== 0), option.value];
            }

            setSelectedOptions(newSelected);
            setResponses(prev => ({ ...prev, [question.id]: newSelected }));
        }
    };

    const handleNext = () => {
        if (currentQuestion < dailyCheckInQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOptions([]);
        } else {
            // Analyze and complete
            const analysis = analyzeDailyCheckIn(responses);
            onComplete({ responses, analysis });
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            // Load previous answers
            const prevQuestion = dailyCheckInQuestions[currentQuestion - 1];
            const prevResponse = responses[prevQuestion.id];
            if (Array.isArray(prevResponse)) {
                setSelectedOptions(prevResponse);
            } else if (prevResponse !== undefined) {
                setSelectedOptions([prevResponse]);
            } else {
                setSelectedOptions([]);
            }
        }
    };

    const canProceed = responses[question.id] !== undefined;

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Question {currentQuestion + 1} of {dailyCheckInQuestions.length}</span>
                    <span className="text-sm font-semibold text-fire-orange">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-fire-orange to-fire-red"
                    />
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel p-8"
                >
                    {/* Question */}
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        {question.question}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3 mb-8">
                        {question.options.map((option, index) => {
                            const isSelected = question.type === 'single'
                                ? responses[question.id] === option.value
                                : selectedOptions.includes(option.value);

                            return (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleSelectOption(option)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${isSelected
                                            ? 'bg-gradient-to-r from-fire-orange/20 to-fire-red/20 border-fire-orange shadow-[0_0_20px_rgba(255,94,0,0.3)]'
                                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg">{option.label}</span>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-6 h-6 rounded-full bg-fire-orange flex items-center justify-center"
                                            >
                                                <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!canProceed}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-fire-orange to-fire-red text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,94,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLastQuestion ? (
                                <>
                                    Complete
                                    <FontAwesomeIcon icon={faCheck} className="ml-2" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
