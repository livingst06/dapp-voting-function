import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card, ListGroup, Table } from 'react-bootstrap'

function AuthorizedAccounts(props) {
	const [adresses, setAdresses] = useState([])
	const [loading, setLoading] = useState(true)
	const [ws, setWs] = useState(null)

	useEffect(() => {
		init()

		const client = props.contract.events
		.VoterRegistered(
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
		client.on('connected', () => setWs(client))
		client.on('changed', function (event) {
			// remove event from local database
		})
		client.on('error', function (error, receipt) {
			// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
			console.log('on error', receipt) // same results as the optional callback above
		})


		return () => {

			ws && ws.unsubscribe() // if ws !== null then ws.unsubscribe()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
 

	useEffect(() => {
		 
		if ( !ws) return

		ws.on('data', (event) => init())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ws])


	const init = async () => {
		// récupérer la liste des comptes autorisés
		const initAddress = await props.contract.methods.getAdresses().call()
		setAdresses(initAddress)
		
		setLoading(false)
	}

	if (loading) return <div>loading authorized accounts...</div>

	return (
		<div style={{ display: 'flex', justifyContent: 'center' }}>
			<Card style={{ width: '50rem' }}>
				<Card.Header>
					<strong>Liste des comptes autorisés</strong>
				</Card.Header>
				<Card.Body>
					<ListGroup variant="flush">
						<ListGroup.Item>
							<Table striped bordered hover>
								<tbody>
									{adresses.map((address, i) => (
										<tr key={i}>
											<td>{address}</td>
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

export default AuthorizedAccounts
