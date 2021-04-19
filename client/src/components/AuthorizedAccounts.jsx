import  React, {useState, useEffect} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {Card, ListGroup, Table } from 'react-bootstrap'

function AuthorizedAccounts(props) {


	const [ adresses, setAdresses ] = useState([])
	const [ loading, setLoading ] = useState(true)
	
	let subId = null


	useEffect(() => {
		runInit()
		return () => {
			cleanup()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])


	const cleanup = () => {

		subId.unsubscribe()
		
	}

	const runInit = async () => {
		try {



			// récupérer la liste des comptes autorisés
			const _adresses = await props.contract.methods.getAdresses().call()
			// Mettre à jour le state


			//subscribe to event Voted
			subId = props.contract.events.VoterRegistered(
				{
					fromBlock: props.web3.eth.getBlock('latest').number,
				},
				function (error, event) {
					//console.log('event after voted',event)
				}
			)
			.on('connected', function (subscriptionId) {})
			.on('data', (event) => addAuthorizedAccount(event))
			.on('changed', function (event) {
					// remove event from local database
			})
			.on('error', function (error, receipt) {
					// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
					console.log('on error', receipt) // same results as the optional callback above
			})


			setAdresses(_adresses)
			setLoading(false)

			 
		} catch (error) {
			setLoading(false)

			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)


		}
	}	


	const addAuthorizedAccount = async (event) => {
		
		const _adresses = await props.contract.methods.getAdresses().call()
		setAdresses(_adresses)

		// const localArray = [...adresses,event.returnValues.voterAddress]
		// setAdresses(localArray)
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
											{
												adresses.map((address, i) => (
													<tr key={i}>
														<td>{address}</td>
													</tr>
												))
											}
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

