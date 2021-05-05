import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import React, { useState, useEffect, useRef } from 'react'
import { ButtonGroup, ToggleButton } from 'react-bootstrap'

import Voting from './contracts/Voting.json'
import getWeb3 from './getWeb3'
import TheNavbar from './components/TheNavbar'
import AuthorizedAccounts from './components/AuthorizedAccounts'
import ListProposals from './components/ListProposals'
import MakeProposal from './components/MakeProposal'
import AuthorizeAccount from './components/AuthorizeAccount'
import VoteFor from './components/VoteFor'
import TheWinnerBox from './components/TheWinnerBox'

function useIsMountedRef() {
	const isMountedRef = useRef(null)
	useEffect(() => {
		isMountedRef.current = true
		return () => (isMountedRef.current = false)
	})
	return isMountedRef
}

function App() {
	const [account, setAccount] = useState(null)
	const [wfs, setWfs] = useState(null)
	const [loading, setLoading] = useState(true)
	const [ws, setWs] = useState(null)
	const [web3, setWeb3] = useState(null)

	const ownerRef = useRef(null)
	const contractRef = useRef(null)
	const isMountedRef = useIsMountedRef()

	useEffect(() => {
		init()
		return () => ws && ws.unsubscribe()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!contractRef) return

		if (!web3) return

		//subscribe to event Voted
		const client = contractRef.current.events.WorkflowStatusChange(
			{
				fromBlock: web3.eth.getBlock('latest').number,
			},
			function (error, event) {
				//console.log('event after voted',event)
			}
		)

		client.on('connected', () => isMountedRef.current && setWs(client))
		client.on('changed', function (event) {
			// remove event from local database
		})
		client.on('error', function (error, receipt) {
			// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
			console.log('on error', receipt) // same results as the optional callback above
		})

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading])


 
	useEffect(() => {
		//detect account change
		web3 && web3.currentProvider.on('accountsChanged', (accounts) => handleAccountChange(accounts))

		// detect Network account change
		web3 && web3.currentProvider.on('chainChanged', (chainId) => handleNetworkIdChange(chainId))

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [web3])

	useEffect(() => {
		ws && ws.on('data', (event) => handleWfsChange(event))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ws])

	const init = async () => {
		try {
			// Get network provider and web3 instance.
			const _web3 = await getWeb3()
			isMountedRef.current && setWeb3(_web3)


			// set the current account
			const _accounts = await _web3.eth.getAccounts()
			isMountedRef.current && setAccount(_accounts[0])

			// Get the contract instance.
			const networkId = await _web3.eth.net.getId()

			if (!networkId) return


			const deployedNetwork = Voting.networks[networkId]

			if (!deployedNetwork) return

			contractRef.current = new _web3.eth.Contract(
				Voting.abi,
				deployedNetwork && deployedNetwork.address
			)


			if (!contractRef.current) return

			ownerRef.current = await contractRef.current.methods.owner().call()

			// récupérer le statut etat du vote et le mettre dans le state
			const _wfs = await contractRef.current.methods.getWorkFlowStatus().call()

			isMountedRef.current && setWfs(_wfs)
			isMountedRef.current && setLoading(false)
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)
			isMountedRef.current && setLoading(false)
		}
	}



	const handleAccountChange = (accounts) => setAccount(accounts[0])



	const handleNetworkIdChange = async (chainId) => {

			if (!web3) return 

			const deployedNetwork = Voting.networks[chainId]

			if (!deployedNetwork) return

			contractRef.current = new web3.eth.Contract(
				Voting.abi,
				deployedNetwork && deployedNetwork.address
			)
			
			if (!contractRef.current) return

			ownerRef.current = await contractRef.current.methods.owner().call()

			// récupérer le statut etat du vote et le mettre dans le state
			const _wfs = await contractRef.current.methods.getWorkFlowStatus().call()

			isMountedRef.current && setWfs(_wfs)
		
	}


	const handleWfsChange = (event) => {
		switch (parseInt(event.returnValues.newStatus)) {
			case 0:
				isMountedRef.current && setWfs('RegisteringVoters')
				break
			case 1:
				isMountedRef.current && setWfs('ProposalsRegistrationStarted')
				break
			case 2:
				isMountedRef.current && setWfs('ProposalsRegistrationEnded')
				break
			case 3:
				isMountedRef.current && setWfs('VotingSessionStarted')
				break
			case 4:
				isMountedRef.current && setWfs('VotingSessionEnded')
				break
			case 5:
				isMountedRef.current && setWfs('VotesTallied')
				break
			default:
				break
		}
	}

	const radios = [
		{
			name: 'Enregistrement des votants',
			value: 'RegisteringVoters',
		},
		{
			name: 'Demarrer enregistrement des propositions',
			value: 'ProposalsRegistrationStarted',
		},
		{
			name: 'arreter enregistrement des propositions',
			value: 'ProposalsRegistrationEnded',
		},
		{
			name: 'Vote en cours',
			value: 'VotingSessionStarted',
		},
		{ name: 'Vote Terminé', value: 'VotingSessionEnded' },
		{
			name: 'Designation du gagnant',
			value: 'VotesTallied',
		},
	]

	const handleToggleChange = async (event) => {
		// Only owner of the contract can change this toggle.
		// other users can only see toggle position but cannot change it.
		if (account !== ownerRef.current) return

		const targetting = event.currentTarget.value

		try {
			isMountedRef.current && setLoading(true)

			await updateVotingProcess(targetting)

			isMountedRef.current && setWfs(targetting)
			isMountedRef.current && setLoading(false)
		} catch (error) {
			// Remettre le toggle a previous
			//document.getElementById('radioToggle').value = previous
			isMountedRef.current && setLoading(false)
		}
	}

	const updateVotingProcess = async (status) => {
		// Interaction avec le smart contract pour changer statuts du process de voting

		switch (status) {
			case 'RegisteringVoters':
				await contractRef.current.methods
					.startRegisteringVoters()
					.send({ from: account })
				break
			case 'ProposalsRegistrationStarted':
				await contractRef.current.methods
					.startProposalRegistration()
					.send({ from: account })
				break
			case 'ProposalsRegistrationEnded':
				await contractRef.current.methods
					.stopProposalRegistration()
					.send({ from: account })
				break
			case 'VotingSessionStarted':
				await contractRef.current.methods
					.startVotingSession()
					.send({ from: account })
				break
			case 'VotingSessionEnded':
				await contractRef.current.methods
					.stopVotingSession()
					.send({ from: account })
				break
			case 'VotesTallied':
				// Afficher le div qui affiche le gagnant
				await contractRef.current.methods.votesTallied().send({ from: account })
				break
			default:
				break
		}
	}

	if (!web3) {
		return <div>please connect to metamask</div>
	}

	if (loading) {
		return <div>loading...</div>
	}

	return (
		<div className="App">
			<TheNavbar account={account} />

			<ButtonGroup toggle>
				{radios.map((radio, idx) => (
					<ToggleButton
						key={idx}
						type="radio"
						variant={wfs === radio.value ? 'success' : 'secondary'}
						name="radioToggle"
						value={radio.value}
						checked={wfs === radio.value}
						disabled={ownerRef.current !== account}
						onChange={handleToggleChange}
					>
						{radio.name}
					</ToggleButton>
				))}
			</ButtonGroup>

			<br></br>
			<br></br>
			{ownerRef.current === account && wfs === 'RegisteringVoters' && (
				<AuthorizedAccounts
					web3={web3}
					contract={contractRef.current}
				/>
			)}
			{ownerRef.current !== account && wfs === 'RegisteringVoters' && (
				<div>waiting for register your proposal --&gt;&gt;&gt;&gt; </div>
			)}
			<br></br>
			{wfs !== 'RegisteringVoters' && isMountedRef.current && (
				<ListProposals web3={web3} contract={contractRef.current} />
			)}
			<br></br>
			{ownerRef.current === account && wfs === 'RegisteringVoters' && (
				<AuthorizeAccount contract={contractRef.current} account={account} />
			)}
			<br></br>
			{wfs === 'ProposalsRegistrationStarted' && (
				<MakeProposal contract={contractRef.current} account={account} />
			)}
			<br></br>
			{wfs === 'VotingSessionStarted' && (
				<VoteFor contract={contractRef.current} account={account} />
			)}
			<br></br>
			{wfs === 'VotesTallied' && (
				<TheWinnerBox contract={contractRef.current} />
			)}
		</div>
	)
}

export default App
