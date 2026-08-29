export default function AgentPanel() {
    return (
        <div className="mb-12">
            <h2 className="text-lg font-bold font-mono mb-6">
                TASK DELEGATION AGENTS [READ-ONLY]
            </h2>

            <div className="border border-gray-300 rounded p-6 bg-white font-mono text-xs">
                <div className="text-gray-700 whitespace-pre-wrap">
                    {`• UNIT: Rescheduling Agent v2.1
• PARSING CALENDAR: 5 slots found (Mon 10:23-13:1 via merging deadlines)
• CONFIRMED DEPENDENCIES: AI Lab + DBMS (chain critical)
• TIME BUDGET ALLOCATE: 48 hrs available (36% availability of success: 89%)
• WAITING FOR USER INPUT...
• SYSTEM: Background telemetry stable. Memory usage: 32%`}
                </div>
            </div>
        </div>
    );
}