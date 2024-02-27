import React, { useState, useEffect } from 'react';
import ExecutorSupplierVotingStrategyABI from '../../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
import Web3 from 'web3';
import ManagerContractABI from '../../contracts/abis/managerContractAbi.json';
import { StrategyWasExecutedModal } from "./modalStrategyExecuted";
const {managerContractAddress} = require('../../contracts/contractsAddresses.json');


export const Supplier = ({ projecExecutor, setOfferMilestonesModalClosed, supplierAddress, profileId }) => {

    const [voted, setVoted] = useState(null);
    const [pendingMilestone, setPendingMilestone] = useState(null);
    const [pendingMilestoneIndex, setPendingMilestoneIndex] = useState(null);
    const [projectMilestones, setProjectMilestones] = useState([]);
    const [offeredMilestones, setOfferedMilestones] = useState([]);
    const [reviewed, setReviewed] = useState(null);
    const [strategyIsExecuted, setStrategyIsExecuted] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {

        const initWeb3 = async () => {
            try{
                if (window.ethereum) {
                    try{

                        const web3Instance = new Web3(window.ethereum);
    
                        const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
                        const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
                        const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);

                        const offeeredMilestones = await ExecutorSupplierVotingStrategy.methods.getOffeeredMilestones(projecExecutor).call();
                        // console.log("=====> Offeered Milestones")
                        // console.log(offeeredMilestones)
                        setOfferedMilestones(offeeredMilestones);

                        const gotSupplierVote = await ExecutorSupplierVotingStrategy.methods.getSupplierOfferedMilestonesVote(projecExecutor, supplierAddress).call();
    
                        setVoted(Number(gotSupplierVote));
                        // console.log("=====> gotSupplierVote")
                        // console.log(voted)

                        const projectMilestns = await ExecutorSupplierVotingStrategy.methods.getMilestones(projecExecutor).call();
                        // console.log("=====> Milestones")
                        // console.log(projectMilestns)

                        if (projectMilestns.length){

                            setProjectMilestones(projectMilestns)

                            const pendingMilestone = projectMilestns.find(milestone=> Number(milestone.milestoneStatus) == 1);
                            // console.log("=====> pendingMilestone")
                            // console.log(pendingMilestone)
                            setPendingMilestone(pendingMilestone);
        
                            const upcommingMilestones = Number(await ExecutorSupplierVotingStrategy.methods.getUpcomingMilestone(projecExecutor).call());
                            setPendingMilestoneIndex((upcommingMilestones));
                            // console.log("===== upcommingMilestones, INDEX:", upcommingMilestones)
                            // console.log(upcommingMilestones);

                            const supplierSubmittedMilestonesVote = Number(await ExecutorSupplierVotingStrategy.methods.getSupplierSubmittedMilestonesVote(upcommingMilestones, supplierAddress).call());
                            // console.log("===== supplierSubmittedMilestonesVote:", upcommingMilestones)
                            // console.log(supplierSubmittedMilestonesVote);

                            if (supplierSubmittedMilestonesVote)
                                setReviewed(supplierSubmittedMilestonesVote);
                        }
                    }
                    catch(error){
                        console.log("Error fetching Strategy data:", error);
                    }

                } else {
                    console.log("Please install MetaMask!");
                }
            }
            catch(err){
                console.log("---- initWeb3 ERROR:")
                console.log(err)
            }
        };

        initWeb3();
    }, [reviewed]);

    const handleReview = async (status) => {

        setLoading(true);

        const web3Instance = new Web3(window.ethereum);
        const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
        const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
        const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);
        const accounts = await web3Instance.eth.getAccounts();

        try{

            const tx = {
                from: accounts[0],
                to: strategyAddress,
                data: ExecutorSupplierVotingStrategy.methods.reviewOfferedtMilestones(
                    projecExecutor,
                    status
                ).encodeABI()
            };

            const estimatedGas = await web3Instance.eth.estimateGas(tx);
            // console.log("==========> SUPPLIER REVIEW MILESTONE ESITMATED GAS LIMIT")
            // console.log(estimatedGas)

            const gasLimit = Math.floor(Number(estimatedGas) * 1.1);
            tx.gas = gasLimit;

            const sentTx = await web3Instance.eth.sendTransaction(tx);
            const txReceipt = await web3Instance.eth.getTransactionReceipt(sentTx.transactionHash);
            console.log("========> txReceipt <===========")
            console.log(txReceipt)

            setVoted(Number(77));
            setOfferMilestonesModalClosed(true);
        }
        catch (error) {
            console.log("Error handleReview:", error);
        }

        setLoading(false);
    };

    const handleReviewSubmittedMilestone = async (status) => {

        setLoading(true);

        const web3Instance = new Web3(window.ethereum);
        const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
        const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
        const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);

        try{

            const tx = {
                from: supplierAddress,
                to: strategyAddress,
                data: ExecutorSupplierVotingStrategy.methods.reviewSubmitedMilestone(
                    projecExecutor,
                    pendingMilestoneIndex,
                    status
                ).encodeABI()
            };

            const estimatedGas = await web3Instance.eth.estimateGas(tx);
            // console.log("==========> SUPPLIER REVIEW MILESTONE ESITMATED GAS LIMIT")
            // console.log(estimatedGas)

            const gasLimit = Math.floor(Number(estimatedGas) * 1.1);
            tx.gas = gasLimit;

            // // // Send the transaction
            const sentTx = await web3Instance.eth.sendTransaction(tx);
            const txReceipt = await web3Instance.eth.getTransactionReceipt(sentTx.transactionHash);
            // console.log("========> txReceipt <===========")
            // console.log(txReceipt)

            setOfferMilestonesModalClosed(true);
            setReviewed(true);

            const projectMilestns = await ExecutorSupplierVotingStrategy.methods.getMilestones(projecExecutor).call();
            // console.log("=====> Milestones")
            // console.log(projectMilestns)

            const acceptedMilestones = projectMilestns.filter(milestone=> Number(milestone.milestoneStatus) == 2);
            // console.log("=====> acceptedMilestones")
            // console.log(acceptedMilestones)

            if (acceptedMilestones.length == projectMilestns.length)
                setStrategyIsExecuted(true);

        }
        catch (error) {
            console.log("Error handleReviewSubmittedMilestone:", error);
        }

        setLoading(false);
    };

    return (
        <>
            {loading ? (
                <div style={loadingBarContainerStyle}>
                    <div className="loader"></div>
                </div>
            ) : (
                <div style={progressBarContainerStyle}>
                    {(offeredMilestones.length && !voted && !projectMilestones.length) ? (
                        <div>
                            <p style={infoStyle}>As a Supplier Hat wearer, you have the power to vote on the project's milestone proposals.</p>
                            <div style={milestonesFlexContainerStyle}>
                                <button className="reject-button" onClick={() => {handleReview(3)}}>
                                    Reject Milestones
                                </button>
                                <button className="accept-button" onClick={() => {handleReview(2)}}>
                                    Accept Milestones
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={infoStyle}>
                            <p>{projectMilestones.length ? "Milestones have already been voted on." : "There are no milestones to vote on currently."}</p>
                        </div>
                    )}
    
                    {
                        voted ? (
                            <div>
                                <p style={infoStyle}>Thank you for casting your vote on offered milestones. Your active participation plays a crucial role in shaping the direction of the project.</p>
                            </div>
                        )
                        :
                            <div style={infoStyle}>
                                <p></p>
                            </div>
                    }
    
                    {reviewed && (
                        <div>
                            <p style={infoStyle}>You have successfully reviewed the milestone.</p>
                        </div>
                    )}
    
                    {(pendingMilestone && !reviewed) && (
                        <div>
                            <p style={infoStyle}>As a Supplier Hat wearer, you have the power to vote on the project's submitted milestone.</p>
                            <p style={infoStyle}>Please review the pending milestone listed above and make your decision by either accepting or declining it.</p>
                            <div style={milestonesFlexContainerStyle}>
                                <button className="reject-button" onClick={() => {handleReviewSubmittedMilestone(3)}}>
                                    Reject Milestones
                                </button>
                                <button className="accept-button" onClick={() => {handleReviewSubmittedMilestone(2)}}>
                                    Accept Milestones
                                </button>
                            </div>
                        </div>
                    )}
    
                    {strategyIsExecuted && (
                        <StrategyWasExecutedModal 
                            setShowModal={setStrategyIsExecuted}
                            setOfferMilestonesModalClosed={setOfferMilestonesModalClosed}
                        />
                    )}
                </div>
            )}
        </>
    );    
}

const infoStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '20px',
    marginRight: '30px',
    marginLeft: '30px',

    fontFamily: "RaxtorRegular",
    marginRight: '25px',

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
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

const milestonesFlexContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};


