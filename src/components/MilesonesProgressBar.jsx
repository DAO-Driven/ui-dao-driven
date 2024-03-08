export const MilestonesProgressBar = ({ completed }) => {
    
    const containerStyles = {
        height: 20,
        width: '97%',
        backgroundColor: "white",
        border: `1px solid #b0b0b0`,
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        margin: 10
    };

    const fillerStyles = {
        height: '100%',
        width: `${completed}%`,
        backgroundColor: "white",
        border: completed > 70 ? `1px solid #4caf50` : completed > 40 ? `1px solid #8155BA` : '#695E93',
        borderRadius: 'inherit',
        textAlign: 'right',
        transition: 'width 1s ease-in-out'
    };

    const labelStyles = {
        padding: 7,
        color: completed > 70 ? `#4caf50` : completed > 40 ? '#8155BA' : '#695E93',
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: "FaunaRegular",
        fontSize: '13px',
    };

    const labelOppositeStyles = {
        padding: 7,
        color: 'black',
        marginLeft: 10,
        fontFamily: "FaunaRegular",
        fontSize: '13px',
    };

    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                {completed == 50 && (
                    <span style={labelStyles}>Offered</span>
                )}
                {completed == 100 && (
                    <span style={labelStyles}>Defined</span>
                )}
                {completed < 50 && (
                    <span style={labelOppositeStyles}>Awaiting</span>
                )}
            </div>
        </div>
    );
};
