import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import ExecutorSupplierVotingStrategyABI from '../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
import {MilestonesProgressBar} from "./MilesonesProgressBar";
import { ProgressBarVotes } from "./milestonesPhases/ProgressBarVotes"
const {managerContractAddress} = require('../contracts/contractsAddresses.json');


export const ExploreFinishedProject = ({ profileId, setActiveProject }) => {
    const [projectData, setProjectData] = useState(null);
    const [offeredMilestones, setOfferedMilestones] = useState([]);
    const [projectMilestones, setProjectMilestones] = useState([]);
    const [offeredMilestonesVotes, setOfferedMilestonesVotes] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [milestonesWithStatus, setMilestonesWithStatus] = useState([]);
    const [strategyState, setStrategyStatus] = useState("");
    const [projectRejectVotesFor, setProjectRejectVotesFor] = useState(0);
    const [projectRejectVotesAgainst, setProjectRejectVotesAgainst] = useState(0);
    const [amountToSend, setAmountToSend] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fundsSent, setFundsSent] = useState(false);
    const [totalSupply, setTotalSupply] = useState(null);


    const handleSendFunds = async () => {

        setLoading(true);

        if (amountToSend > 0){

            const web3Instance = new Web3(window.ethereum);
            const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
            
            try {

                const fetchedAccounts = await web3Instance.eth.getAccounts();
                const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
                const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);
                // console.log("====> Sending amount:", )
                
                const amountInWei = web3Instance.utils.toWei(amountToSend, 'ether');

                // Send the transaction
                const txReceipt = await ExecutorSupplierVotingStrategy.methods.sendTokenOfThanksToSuppliers(amountInWei).send({ 
                    from: fetchedAccounts[0], 
                    value: amountInWei 
                });

                // Send the transaction
                console.log("========> txReceipt <===========");
                console.log(txReceipt);

                setFundsSent(true);

            } catch (error) {
                console.error("Error sending funds:", error);
                alert("Error in sending funds. See console for details.");
            }
        }

        setLoading(false);
    }
    const handleBackButtonClick = () => {
        setActiveProject(false);
    };

    const calculatePhaseOneMilestones = () => {
        if (offeredMilestones.length && projectMilestones.length)
            return {progress: 100, info: "Milestones Confirmed"};
        else if (offeredMilestones.length)
            return {progress: 50, info: "Awaiting Milestones Review"};
        else    
            return {progress: 0, info: "Awaiting Milestones Offer"}; 
    }

    const calculateVotesPercentage = (totalValue, partialValue) => {
        if (totalValue == 0)
            return 0;

        return (partialValue / totalValue) * 100;
    }

    const milestoneStatusLabel = (status) => {
        if (status === 1) {
            return (
                <span style={{
                    color: 'orange',
                    border: '1px solid orange', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Pending
                </span>
            );
        }
        else if (status === 2){
            return (
                <span style={{
                    color: '#4caf50',
                    border: '1px solid #4caf50', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Accepted
                </span>
            );
        }
        else if (status === 3){
            return (
                <span style={{
                    color: '#C70039',
                    border: '1px solid #C70039', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Rejected
                </span>
            );
        }
        else if (status === 3){
            return (
                <span style={{
                    color: '#C70039',
                    border: '1px solid #C70039', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    unknow
                </span>
            );
        }

    };

    const milestoneNameColor = (status, name) => {
        if (status === 1) {
            return (
                <span style={{
                    color: 'orange',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
        else if (status === 2) {
            return (
                <span style={{
                    color: '#4caf50',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
        else if (status === 3) {
            return (
                <span style={{
                    color: '#C70039',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
    };
    
    
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);

                let votingStrategyAddress;

                try {

                    const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
                    votingStrategyAddress = strategyAddress;

                    const supply = await managerContract.methods.getProjectSupply(profileId).call();
                    setProjectData(supply);

                } catch (error) {
                    console.error("Error fetching project data:", error);
                }

                const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, votingStrategyAddress);

                try{

                    const rejectVotesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getRejectProjectVotesAgainst().call());
                    // console.log("---> rejectVotesAgainst:", rejectVotesAgainst)
                    setProjectRejectVotesAgainst(rejectVotesAgainst);

                    const rejectVotesFor = Number(await ExecutorSupplierVotingStrategy.methods.getRejectProjectVotesFor().call());
                    // console.log("---> rejectVotesFor:", rejectVotesFor)
                    setProjectRejectVotesFor(rejectVotesFor);

                    const projectExecutor = await managerContract.methods.getProjectExecutor(profileId).call();
                    // console.log("===== Project Executor")
                    // console.log(projectExecutor)

                    const offeeredMilestones = await ExecutorSupplierVotingStrategy.methods.getOffeeredMilestones(projectExecutor).call();
                    // console.log("=====> Offeered Milestones")
                    // console.log(offeeredMilestones)
                    setOfferedMilestones(offeeredMilestones);

                    const milestones = await ExecutorSupplierVotingStrategy.methods.getMilestones(projectExecutor).call();
                    // console.log("=====> Milestones")
                    // console.log(milestones)
                    setProjectMilestones(milestones)

                    const strategyState = Number(await ExecutorSupplierVotingStrategy.methods.state().call());
                    // console.log("=====> strategyState")
                    // console.log(strategyState)
                    setStrategyStatus(strategyState)

                    const strategyTotalSupply = Number(await ExecutorSupplierVotingStrategy.methods.totalSupply().call());
                    // console.log("=====> strategyTotalSupply")
                    console.log(strategyTotalSupply)
                    setTotalSupply(strategyTotalSupply)

                    if (milestones.length){

                        const milestonesStatus = milestones.filter(milestn=> Number(milestn.milestoneStatus));

                        if (milestonesStatus.length){

                            const milestonesWithVotes = await Promise.all(milestonesStatus.map(async (milestone, index) => {
                                const votesFor = Number(await ExecutorSupplierVotingStrategy.methods.getSubmittedMilestonesVotesFor(index).call());
                                const votesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getSubmittedMilestonesVotesAgainst(index).call());
   
                                return {
                                    ...milestone,
                                    votesFor,  
                                    votesAgainst  
                                };
                            }));
                            
                            setMilestonesWithStatus(milestonesWithVotes);
                        }
                    }

                    if (offeeredMilestones){

                        const votesFor = Number(await ExecutorSupplierVotingStrategy.methods.getOfferedMilestonesVotesFor(projectExecutor).call());
                        const votesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getOfferedMilestonesVotesAgainst(projectExecutor).call());

                        if ((votesFor) || (votesAgainst))
                            setOfferedMilestonesVotes({votesFor: (votesFor), votesAgainst: (votesAgainst)});
                        }
                }
                catch (error) {
                    console.error("Error fetching Strategy data:", error);
                }

            } else {
                console.log("Please install MetaMask!");
            }

            setIsDataLoaded(true);
        };

        initWeb3();
    }, []);

    const buttonContentStyle = {
        fontSize: '27px',
        marginTop: '21px',  
        marginBottom: '21px',
        backgroundColor: "white",
        color: amountToSend > 0 ? '#8155BA' : '#CCCCCC',
        border: '1px solid #8155BA',
        borderRadius: "15px",
        cursor: amountToSend > 0 ? 'pointer' : 'not-allowed', // Change cursor when form is invalid
        minWidth: '150px',
        paddingTop: '10px', 
        paddingBottom: '10px',
        opacity: amountToSend > 0 ? 1 : 0.5, // Change opacity when form is invalid
        fontFamily: "FaunaRegular",
    };

    return (
        <div>
            <div className='row'>
                {(projectData) && (
                    <div className='col-md-12' style={contentStyle}>
                        <div style={buttonContainerStyle}>
                            <button 
                                className="regular-button" 
                                onClick={handleBackButtonClick}
                            >
                                {"<<< Back to projects"}
                            </button>
                        </div>
                        <div>
                            <h3 style={h3Style}>{projectData.name}</h3>
                            <p style={pStyle}>{projectData.description}</p>
                            <p style={pStyle}>Project's Strategy state: {milestoneStatusLabel(strategyState)}</p>

                            <div style={progressBarContainerStyle}>
                                <p style={fundingStyle}>status: {calculatePhaseOneMilestones().info}</p>
                                    <MilestonesProgressBar completed={calculatePhaseOneMilestones().progress}/>
                            </div>

                            {
                                (projectRejectVotesFor || projectRejectVotesAgainst) ? (
                                    <div style={milestonesFlexContainerStyle}>
                                        <div style={progressBarVotesForContainerStyle}>
                                            <p style={infoStyle}>Reject Project Votes</p>
                                            <ProgressBarVotes 
                                                completed={calculateVotesPercentage(totalSupply, projectRejectVotesFor)}
                                                label={"For"}
                                                color={"#C70039"}
                                            />
                                            <ProgressBarVotes 
                                                completed={calculateVotesPercentage(totalSupply, projectRejectVotesAgainst)}
                                                label={"Against"}
                                                color={"#4caf50"}
                                            />
                                        </div>
                                    </div>
                                )
                                : (
                                    <div style={infoStyle}>
                                        <p></p>
                                    </div>
                                )
                            }

                            {
                                (offeredMilestones.length && isDataLoaded) ? (
                                    
                                    <>
                                        <p style={submitedMilestonesStyle}>Defined Milestones</p>
                                        <div style={milestonesFlexContainerStyle}>
                                            {offeredMilestones.map((milestone, i) => (
                                                <div key={`milestone-${i}`} style={{ minWidth: '200px' }}>
                                                    <p style={pStyle}>Milestone {i + 1}</p>
                                                    <p style={milestoneInfoStyle}>Percentage to distribute: {(Number(milestone.amountPercentage) / totalSupply) * 100}%</p>
                                                    <p style={milestoneInfoStyle}>Pointer: {milestone.metadata.pointer}</p>
                                                    <p style={milestoneInfoStyle}>Description: {milestone.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {
                                            (offeredMilestonesVotes && isDataLoaded) ? (
                                                <div style={milestonesFlexContainerStyle}>
                                                    <div style={progressBarVotesForContainerStyle}>
                                                            <p style={infoStyle}>Offered Milestones Votes</p>
                                                            <ProgressBarVotes 
                                                                completed={calculateVotesPercentage(totalSupply, offeredMilestonesVotes.votesFor)}
                                                                label={"Votes For"}
                                                                color={"#4caf50"}
                                                            />
                                                            <ProgressBarVotes 
                                                                completed={calculateVotesPercentage(totalSupply, offeredMilestonesVotes.votesAgainst)}
                                                                label={"Votes Against"}
                                                                color={"#C70039"}
                                                            />
                                                    </div>
                                                </div>
                                            )
                                            : (
                                                <div style={infoStyle}>
                                                    <p></p>
                                                </div>
                                            )
                                        }
                                    </>
                                )
                                : (
                                    <div style={infoStyle}>
                                        <p></p>
                                    </div>
                                )
                            }

                            {
                                (milestonesWithStatus.length && isDataLoaded) ? (

                                    <>
                                    <p style={submitedMilestonesStyle}>Submited Milestones</p>
                                    <div style={milestonesFlexContainerStyle}>
                                        {milestonesWithStatus.map((milestone, i) => (
                                            <div key={`milestone-${i}`} style={{ minWidth: '200px' }}>
                                                <p style={pStyle}>{milestoneNameColor(Number(milestone.milestoneStatus), `Milestone ${i + 1}`)}</p>
                                                <p style={milestoneInfoStyle}>Percentage to distribute: {(Number(milestone.amountPercentage) / totalSupply) * 100}%</p>
                                                <p style={milestoneInfoStyle}>Description: {milestone.description}</p>
                                                <p style={milestoneInfoStyle}>Description: {milestone.metadata.pointer}</p>
                                                <p style={milestoneInfoStyle}>Status: {milestoneStatusLabel(Number(milestone.milestoneStatus))}</p>
                                                <div style={milestonesFlexContainerStyle}>
                                                <div style={progressBarVotesForContainerStyleSmall}>
                                                        <p style={infoStyle}>Milestone's Votes</p>
                                                        <ProgressBarVotes 
                                                            completed={calculateVotesPercentage(totalSupply, milestone.votesFor)}
                                                            label={"Votes For"}
                                                            color={"#4caf50"}
                                                        />
                                                        <ProgressBarVotes 
                                                            completed={Number(milestone.milestoneStatus) != 3 ? calculateVotesPercentage(totalSupply, milestone.votesAgainst) : 100}
                                                            label={"Votes Against"}
                                                            color={"#C70039"}
                                                        />
                                                </div>
                                            </div>

                                            </div>
                                        ))}
                                    </div>
                                    </>
                                )
                                : (
                                    <div style={infoStyle}>
                                        <p></p>
                                    </div>
                                )
                            }
                             {loading ? (
                                <div style={loadingBarContainerStyle}>
                                    <div className="loader"></div>
                                </div>
                            ) : (
                            <>
                                {fundsSent ? (
                                        <>
                                            <p style={thanksgivingSentStyle}>Thank you for your support of the project's suppliers. They will greatly appreciate receiving your positive feedback and acknowledgment of their contributions 🎉🎉🎉</p>
                                        </>
                                    )
                                :
                                (
                                    <>
                                        <p style={thanksgivingStyle}>Everyone is invited to express their gratitude to the suppliers who have been instrumental in advancing this project. Any contributions made as a token of thanks will be equitably distributed among the suppliers in proportion to their respective contributions to the funding.</p>
                                        <div>
                                            <input 
                                                id="amount" 
                                                style={inputStyle} 
                                                value={amountToSend} 
                                                onChange={(e) => setAmountToSend(e.target.value)} 
                                            />
                                            <button style={buttonContentStyle} onClick={handleSendFunds}>
                                                Send Funds
                                            </button>
                                        </div>
                                    </>
                                )
                            }
                            </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const fundingStyle = {
    fontSize: '17px',
    color: "695E93",
    marginBottom: '0px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
};

const infoStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const submitedMilestonesStyle = {
    fontSize: '17px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px',
    marginRight: '30px',
    marginLeft: '40px',
};

const progressBarContainerStyle = {
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const progressBarVotesForContainerStyle = {
    width: '50%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const progressBarVotesForContainerStyleSmall = {
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const contentStyle = {
    fontSize: '21px',
    marginTop: '50px',
    marginBottom: '20px',
    backgroundColor: '#FFFFFF',
    color: "#8155BA",
    border: '1px solid black',
    borderRadius: "15px",
    width: "100%",
    paddingTop: '30px',
    paddingBottom: '10px',
    // alignItems: 'center', 
    // height: '500px', 
};

const h3Style = { 
    fontSize: '24px', 
    fontWeight: 'bold',
    fontFamily: "FaunaRegular",
};

const pStyle = { 
    fontSize: '16px',
    marginLeft: '30px', 
};

const buttonContainerStyle = {
    textAlign: 'left', // Aligns the button to the left
    paddingTop: '20px',
    // paddingBottom: '20px'
};

const milestoneInfoStyle = {
    fontSize: '13px',
    color: "#281C2D",
    padding: '1px 16px',
};

const milestonesFlexContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const inputStyle = {
    width: '30%', 
    padding: '8px', 
    margin: '10px 0 10px 0',        
    borderRadius: '15px', 
    border: '1px solid #ccc', 
    boxSizing: 'border-box',
    marginBottom: '30px',
    color: "#8155BA",
    marginRight: '25px',
};

const thanksgivingStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '30px',
    marginLeft: '30px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const thanksgivingSentStyle = {
    fontSize: '17px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '30px',
    marginLeft: '60px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};
