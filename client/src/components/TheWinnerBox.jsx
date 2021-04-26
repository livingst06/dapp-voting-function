import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState, useEffect, useRef } from 'react'

import { Card, Table } from 'react-bootstrap'

function useIsMountedRef() {
	const isMountedRef = useRef(null)
	useEffect(() => {
		isMountedRef.current = true
		return () => (isMountedRef.current = false)
	})
	return isMountedRef
}

function TheWinnerBox(props) {
	const [theWinner, setTheWinner] = useState('')
	const [loading, setLoading] = useState(true)
	const isMountedRef = useIsMountedRef()

	useEffect(() => {
		init()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const init = async () => {
		try {
			setTimeout(async () => {
				// récupérer la liste des comptes autorisés
				const _theWinner = await props.contract.methods.winnerName().call()
				// Mettre à jour le state
				isMountedRef.current && setTheWinner(_theWinner)
				isMountedRef.current && setLoading(false)
			}, 3000)
		} catch (error) {
			isMountedRef.current && setLoading(false)

			// Catch any errors for any of the above operations.
			alert(
				'Non-Ethereum browser detected. Can you please try to install MetaMask before starting.'
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
								{loading ? (
									<td>............loading.......</td>
								) : (
									<td>{theWinner}</td>
								)}
							</tr>
						</tbody>
					</Table>
				</Card.Body>
			</Card>
		</div>
	)
}

export default TheWinnerBox
