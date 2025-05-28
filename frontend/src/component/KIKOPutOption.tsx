import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { apiPost } from '../util/ApiUtil'

const KIKOPutOptionRequestSchema = z.object({
  S: z.coerce
    .number({
      invalid_type_error: 'Spot price must be a number'
    })
    .positive('Spot price must be positive'),
  K: z.coerce
    .number({
      invalid_type_error: 'Strike price must be a number'
    })
    .positive('Strike price must be positive'),
  T: z.coerce
    .number({
      invalid_type_error: 'Time to maturity must be a number'
    })
    .positive('Time to maturity must be positive'),
  r: z.coerce
    .number({
      invalid_type_error: 'Risk free rate must be a number'
    })
    .positive('Risk free rate must be positive'),
  sigma: z.coerce
    .number({
      invalid_type_error: 'Volatility must be a number'
    })
    .positive('Volatility must be positive'),
  L: z.coerce
    .number({
      invalid_type_error: 'Lower barrier must be a number'
    })
    .positive('Lower barrier must be positive'),
  U: z.coerce
    .number({
      invalid_type_error: 'Upper barrier must be a number'
    })
    .positive('Upper barrier must be positive'),
  n: z.coerce
    .number({
      invalid_type_error: 'Number of timesteps must be a number'
    })
    .int('Number of timesteps must be an integer')
    .positive('Number of timesteps must be positive'),
  R: z.string()
    .trim()
    .nonempty('Rebate amount must not be empty')
    .refine(value => !isNaN(Number(value)), {
      message: 'Rebate amount must be a number'
    })
    .refine(value => Number(value) >= 0, {
      message: 'Rebate amount must be greater than or equal to 0'
    })
    .transform(value => Number(value))
})

type KIKOPutOptionRequest = z.infer<typeof KIKOPutOptionRequestSchema>

type KIKOPutOptionPriceResponse = {
  price: number | string,
  delta: number | string,
  confident_interval: [number | string, number | string],
  input: KIKOPutOptionRequest
}

const KIKOPutOption = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<KIKOPutOptionRequest>({
    resolver: zodResolver(KIKOPutOptionRequestSchema)
  })

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<KIKOPutOptionPriceResponse | null>(null)

  const onSubmit = async (data: KIKOPutOptionRequest) => {
    setLoading(true)
    console.log("submitted", data)
    try {
      const res = await apiPost<KIKOPutOptionPriceResponse>('/quasi-monte-carlo-kiko-put-option', data)
      setResponse(res)
    } catch (error) {
      setResponse(null)
      console.error("Error in API call", error)
    }
    setLoading(false)
  }

  console.log("errors", errors)
  console.log("response", response)

  return (
    <Box display='flex' flexDirection='column' gap={4} width='100%'>
      <Box display='flex' flexDirection='column' gap={2}>
        <TextField
          id="spot-price"
          label="Spot Price"
          variant="outlined"
          {...register('S')}
          error={!!errors.S}
          helperText={errors.S?.message}
        />
        <TextField
          id="strike-price"
          label="Strike Price"
          variant="outlined"
          {...register('K')}
          error={!!errors.K}
          helperText={errors.K?.message}
        />
        <TextField
          id="time-to-maturity"
          label="Time to Maturity (years)"
          variant="outlined"
          {...register('T')}
          error={!!errors.T}
          helperText={errors.T?.message}
        />
        <TextField
          id="risk-free-rate"
          label="Risk Free Rate"
          variant="outlined"
          {...register('r')}
          error={!!errors.r}
          helperText={errors.r?.message}
        />
        <TextField
          id="volatility"
          label="Volatility"
          variant="outlined"
          {...register('sigma')}
          error={!!errors.sigma}
          helperText={errors.sigma?.message}
        />
        <TextField
          id="lower-barrier"
          label="Lower Barrier"
          variant="outlined"
          {...register('L')}
          error={!!errors.L}
          helperText={errors.L?.message}
        />
        <TextField
          id="upper-barrier"
          label="Upper Barrier"
          variant="outlined"
          {...register('U')}
          error={!!errors.U}
          helperText={errors.U?.message}
        />
        <TextField
          id="number-of-simulations"
          label="Number of Timesteps"
          variant="outlined"
          {...register('n')}
          error={!!errors.n}
          helperText={errors.n?.message}
        />
        <TextField
          id="rebate-amount"
          label="Rebate Amount"
          variant="outlined"
          {...register('R')}
          error={!!errors.R}
          helperText={errors.R?.message}
        />
      </Box>

      <Button
        variant='contained'
        onClick={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? 'Calculating...' : 'Calculate'}
      </Button>

      {response && (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 2 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h6">KIKO Put Option (Quasi-Monte Carlo)</Typography>
          </Box>

          <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }} display={'flex'} justifyContent={'space-between'} alignItems={'flex-start'}>
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                Price
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {typeof response.price === 'number'
                    ? (response.price).toFixed(6)
                    : response.price}
                </Typography>
                <Chip
                  label="PUT OPTION WITH BARRIERS"
                  color="secondary"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                Delta
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {typeof response.delta === 'number'
                    ? (response.delta).toFixed(6)
                    : response.delta}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              95% Confidence Interval
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                py: 0.75,
                px: 1.5,
                borderRadius: 1,
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                border: '1px solid rgba(25, 118, 210, 0.2)'
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'medium',
                  color: 'primary.dark',
                  letterSpacing: '0.01em'
                }}
              >
                {typeof response.confident_interval[0] === 'number'
                  ? (response.confident_interval[0]).toFixed(6)
                  : response.confident_interval[0]}
                {' — '}
                {typeof response.confident_interval[1] === 'number'
                  ? (response.confident_interval[1]).toFixed(6)
                  : response.confident_interval[1]}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
              Input Parameters
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>Spot Price (S)</TableCell>
                  <TableCell align="right">{response.input.S}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Strike Price (K)</TableCell>
                  <TableCell align="right">{response.input.K}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Time to Maturity (T)</TableCell>
                  <TableCell align="right">{response.input.T} year(s)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Risk-Free Rate (r)</TableCell>
                  <TableCell align="right">{response.input.r}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Volatility (σ)</TableCell>
                  <TableCell align="right">{response.input.sigma}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Lower Barrier (L)</TableCell>
                  <TableCell align="right">{response.input.L}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Upper Barrier (U)</TableCell>
                  <TableCell align="right">{response.input.U}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Number of Timesteps (n)</TableCell>
                  <TableCell align="right">{response.input.n.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Rebate Amount (R)</TableCell>
                  <TableCell align="right">{response.input.R}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Pricing Method</TableCell>
                  <TableCell align="right">Quasi-Monte Carlo</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </TableContainer>
      )}
    </Box>
  )
}

export default KIKOPutOption
