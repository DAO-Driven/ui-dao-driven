export const ProgressBarVotes = ({ completed, label, color }) => {
    const containerStyles = {
        height: 20,
        width: '100%',
        backgroundColor: "white",
        border: '1px solid #e0e0de',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        margin: 10
    };

    const fillerStyles = {
        height: '100%',
        width: `${completed}%`,
        border: completed > 0 ? `1px solid ${color}` : 'none', // Conditional border
        backgroundColor: "white",
        borderRadius: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        transition: 'width 1s ease-in-out',
        overflow: 'hidden'
    };        

    const labelStyles = {
        padding: 5,
        color: `${color}`,
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: "FaunaRegular",
        fontSize: '11px',
    };

    const labelOppositeStyles = {
        position: 'absolute',
        left: completed > 0 ? `${completed}%` : '0%', // Position at start for zero
        padding: 5,
        color: '#b0b0b0', 
        fontWeight: 'bold',
        fontFamily: "FaunaRegular",
        fontSize: '11px',
        transform: completed > 0 ? 'translateX(-100%)' : 'none', // No shift for zero
    };

    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                {completed > 0 ? (
                    <span style={labelStyles}>{Math.floor(completed)}% {label}</span>
                ) : (
                    <span style={labelOppositeStyles}>{label}</span>
                )}
            </div>
        </div>
    );
};
