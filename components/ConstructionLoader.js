export default function ConstructionLoader({ message = "Loading" }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'linear-gradient(145deg, #334155 0%, #1e293b 100%)', /* Slate 700 to Slate 800 */
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: 'Inter, sans-serif'
        }}>
            <div className="gear-container">
                <svg className="gear gear-big" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <svg className="gear gear-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            </div>

            <div className="crane-stage">
                <div className="crane-line"></div>
                <div className="box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </div>
            </div>

            <h2 className="loading-text">
                {message}
                <span className="dots"><span>.</span><span>.</span><span>.</span></span>
            </h2>

            <style jsx>{`
                .gear-container {
                    position: relative;
                    width: 100px;
                    height: 80px;
                    margin-bottom: 1rem;
                }
                .gear {
                    position: absolute;
                    color: #3b82f6;
                    animation: spin linear infinite;
                }
                .gear-big {
                    width: 64px;
                    height: 64px;
                    top: 10px;
                    left: 0px;
                    color: #f59e0b; /* Construction yellow */
                    animation-duration: 4s;
                }
                .gear-small {
                    width: 44px;
                    height: 44px;
                    bottom: 0px;
                    right: 8px;
                    color: #3b82f6; /* Accent blue */
                    animation-duration: 2.75s;
                    animation-direction: reverse;
                }
                
                .crane-stage {
                    position: relative;
                    height: 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }
                .crane-line {
                    width: 2px;
                    background: #94a3b8;
                    height: 0px;
                    animation: lower-line 1.5s ease-in-out infinite alternate;
                }
                .box {
                    width: 36px;
                    height: 36px;
                    color: #f8fafc;
                    animation: lower-box 1.5s ease-in-out infinite alternate;
                }
                .box svg {
                    width: 100%;
                    height: 100%;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes lower-line {
                    0% { height: 0px; }
                    100% { height: 30px; }
                }
                @keyframes lower-box {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(30px); }
                }

                .loading-text {
                    font-size: 1.25rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    color: #ffffff; 
                    display: flex;
                    align-items: center;
                    margin: 0;
                }
                .dots span {
                    animation: dot-blink 1.4s infinite both;
                    font-size: 1.5rem;
                    line-height: 1;
                    margin-left: 2px;
                }
                .dots span:nth-child(1) { animation-delay: 0.2s; }
                .dots span:nth-child(2) { animation-delay: 0.4s; }
                .dots span:nth-child(3) { animation-delay: 0.6s; }

                @keyframes dot-blink {
                    0% { opacity: 0.2; }
                    20% { opacity: 1; }
                    100% { opacity: 0.2; }
                }
            `}</style>
        </div>
    )
}
