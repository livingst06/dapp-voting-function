import 'bootstrap/dist/css/bootstrap.min.css'
import  React, {useState, useEffect} from 'react'

import { Card, Table } from 'react-bootstrap'

function TheWinnerBox(props) {


	const [ theWinner, setTheWinner ] = useState('')
	const [ loading, setLoading ] = useState(true)

	useEffect(() => {

		runInit()
		
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])


	const runInit = async () => {
		try {


			setTimeout(async () => {
			
				// récupérer la liste des comptes autorisés
				const _theWinner = await props.contract.methods.winnerName().call()
				// Mettre à jour le state
				setTheWinner(_theWinner)
				setLoading(false)
			
			},3000)


			 
		} catch (error) {
			setLoading(false)

			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)


		}

	}

	return (
	
		<div style={{ display: 'flex', justifyContent: 'center' }}>
			<Card style={{ width: '50rem' }}>
				<Card.Header>
					<strong>Et le gagnant est : </strong>
				</Card.Header>
				<Card.Body>
							<Table striped bordered hover>
								<tbody>
									<tr>
										{loading?<td>............loading.......</td>:<td>{theWinner}</td>}
									</tr>
								</tbody>
							</Table>
				</Card.Body>
			</Card>
		</div>
			
	)
 
}

export default TheWinnerBox
