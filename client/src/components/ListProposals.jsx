import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card, ListGroup, Table } from 'react-bootstrap'

function ListProposals(props) {
	const [proposals, setProposals] = useState([])
	const [loading, setLoading] = useState(true)
	const [wsPropal, setWsPropal] = useState(null)
	const [wsVote, setWsVote] = useState(null)
 

	useEffect(() => {
		updatePropal()

		subscribeWsPropal()

		subscribeWsVote()

		setLoading(false)

		return () => {
			

			wsPropal && wsPropal.unsubscribe() 

			wsVote && wsVote.unsubscribe() 

		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
 

	useEffect(() => {
		 
		if ( !wsPropal) return

		wsPropal.on('data', (event) => updatePropal())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wsPropal])



	useEffect(() => {
		 
		if ( !wsVote) return

		wsVote.on('data', (event) => updatePropal())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wsVote])


	const subscribeWsPropal = () => {

		const client = props.contract.events
			.ProposalRegistered(
				{
					fromBlock: props.web3.eth.getBlock('latest').number,
				},
				function (error, event) {
					if (error) {
						console.error(error)
					}
					// console.log('event after voted', event)
				}
			)


		client.on('connected', () => setWsPropal(client))
		client.on('changed', function (event) {
			// remove event from local database
		})
		client.on('error', function (error, receipt) {
			// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
			console.log('on error', receipt) // same results as the optional callback above
		})


	}

	const subscribeWsVote = () => {

		const client = props.contract.events
			.Voted(
				{
					fromBlock: props.web3.eth.getBlock('latest').number,
				},
				function (error, event) {
					if (error) {
						console.error(error)
					}
					console.log('event after voted', event)
				}
			)


		client.on('connected', () => setWsVote(client))
		client.on('changed', function (event) {
			// remove event from local database
		})
		client.on('error', function (error, receipt) {
			// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
			console.log('on error', receipt) // same results as the optional callback above
		})


	}


	const updatePropal = async (event) => {

		try {
			const _proposals = await props.contract.methods.getProposals().call()
			setProposals(_proposals)
		} catch (error) { 
			console.error(error)
		}
	}

	if (loading) return <div>loading proposals...</div>

	return (
		<div style={{ display: 'flex', justifyContent: 'center' }}>
			<Card style={{ width: '50rem' }}>
				<Card.Header>
					<strong>Liste des propositions</strong>
				</Card.Header>
				<Card.Body>
					<ListGroup variant="flush">
						<ListGroup.Item>
							<Table striped bordered hover>
								<thead>
									<tr>
										<th>candidates</th>
										<th>vote Count</th>
									</tr>
								</thead>
								<tbody>
									{proposals.map((p, i) => (
										<tr key={i}>
											<td>{p.description}</td>
											<td>{p.voteCount}</td>
										</tr>
									))}
								</tbody>
							</Table>
						</ListGroup.Item>
					</ListGroup>
				</Card.Body>
			</Card>
		</div>
	)
}

export default ListProposals
