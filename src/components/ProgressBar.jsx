export const ProgressBar = ({ completed, eth, totalNeeded }) => {
    
    const containerStyles = {
        height: 20,
        width: '80%',
        backgroundColor: "#e0e0de",
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        margin: 10
    };

    const fillerStyles = {
        height: '100%',
        width: `${completed}%`,
        backgroundColor: completed > 70 ? '#4caf50' : completed > 40 ? '#8155BA' : '#695E93',
        borderRadius: 'inherit',
        textAlign: 'right',
        transition: 'width 1s ease-in-out'
    };

    const labelStyles = {
        padding: 5,
        color: 'white',
        fontWeight: 'bold'
    };

    const totalNeededLabelStyles = {
        marginLeft: 'auto', // Pushes the label to the right
        padding: 5,
        color: '#444', // Adjust the color as needed
        fontWeight: 'bold'
    };

    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                <span style={labelStyles}>{`has ${eth} ETH - needs ${totalNeeded} ETH`}</span>
            </div>
            {/* {completed < 91 && (
                <span style={totalNeededLabelStyles}>{`${totalNeeded} ETH needed`}</span>
            )} */}
        </div>
    );
};
