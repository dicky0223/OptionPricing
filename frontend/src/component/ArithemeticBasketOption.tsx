import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
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

const ArithmeticBasketOptionRequestSchema = z.object({
  S1: z.coerce
    .number({
      invalid_type_error: 'First asset price must be a number'
    })
    .positive('First asset price must be positive'),
  S2: z.coerce
    .number({
      invalid_type_error: 'Second asset price must be a number'
    })
    .positive('Second asset price must be positive'),
  sigma1: z.coerce
    .number({
      invalid_type_error: 'First asset volatility must be a number'
    })
    .positive('First asset volatility must be positive'),
  sigma2: z.coerce
    .number({
      invalid_type_error: 'Second asset volatility must be a number'
    })
    .positive('Second asset volatility must be positive'),
  r: z.coerce
    .number({
      invalid_type_error: 'Risk free rate must be a number'
    })
    .positive('Risk free rate must be positive'),
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
  rho: z.string()
    .trim()
    .nonempty('Correlation coefficient must not be empty')
    .refine(value => !isNaN(Number(value)), {
      message: 'Correlation coefficient must be a number'
    })
    .refine(value => Number(value) >= -1 && Number(value) <= 1, {
      message: 'Correlation coefficient must be between -1 and 1'
    })
    .transform(value => Number(value)),
  m: z.coerce
    .number({
      invalid_type_error: 'Number of simulations must be a number'
    })
    .int('Number of simulations must be an integer')
    .positive('Number of simulations must be positive'),
  option_type: z.enum(['call', 'put'], { message: 'Option type must be either call or put' }),
  control_variate: z.enum(['none', 'geometric'], { message: 'Control variate must be either none or geometric' })
})

type ArithmeticBasketOptionRequest = z.infer<typeof ArithmeticBasketOptionRequestSchema>

type ArithmeticBasketOptionPriceResponse = {
  price: number | string,
  confident_interval: [number | string, number | string],
  input: ArithmeticBasketOptionRequest
}

const ArithemeticBasketOption = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ArithmeticBasketOptionRequest>({
    resolver: zodResolver(ArithmeticBasketOptionRequestSchema)
  })

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ArithmeticBasketOptionPriceResponse | null>(null)

  const onSubmit = async (data: ArithmeticBasketOptionRequest) => {
    setLoading(true)
    console.log("submitted", data)
    try {
      const res = await apiPost<ArithmeticBasketOptionPriceResponse>('/monte-carlo-arithmetic-mean-basket-option', data)
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
          id="first-asset-price"
          label="First Asset Price"
          variant="outlined"
          {...register('S1')}
          error={!!errors.S1}
          helperText={errors.S1?.message}
        />
        <TextField
          id="second-asset-price"
          label="Second Asset Price"
          variant="outlined"
          {...register('S2')}
          error={!!errors.S2}
          helperText={errors.S2?.message}
        />
        <TextField
          id="first-asset-volatility"
          label="First Asset Volatility"
          variant="outlined"
          {...register('sigma1')}
          error={!!errors.sigma1}
          helperText={errors.sigma1?.message}
        />
        <TextField
          id="second-asset-volatility"
          label="Second Asset Volatility"
          variant="outlined"
          {...register('sigma2')}
          error={!!errors.sigma2}
          helperText={errors.sigma2?.message}
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
          id="correlation"
          label="Correlation Coefficient"
          variant="outlined"
          {...register('rho')}
          error={!!errors.rho}
          helperText={errors.rho?.message}
        />
        <TextField
          id="number-of-simulations"
          label="Number of Simulations"
          variant="outlined"
          {...register('m')}
          error={!!errors.m}
          helperText={errors.m?.message}
        />

        <FormControl error={!!errors.option_type}>
          <InputLabel id="option-type-label">Option Type</InputLabel>
          <Select
            id='option-type'
            variant='outlined'
            label='Option Type'
            labelId='option-type-label'
            {...register('option_type')}
            defaultValue={'call'}
          >
            <MenuItem value='call'>Call</MenuItem>
            <MenuItem value='put'>Put</MenuItem>
          </Select>
          {errors.option_type && <Typography color="error" variant="caption">{errors.option_type.message}</Typography>}
        </FormControl>

        <FormControl error={!!errors.control_variate}>
          <InputLabel id="control-variate-label">Control Variate</InputLabel>
          <Select
            id='control-variate'
            variant='outlined'
            label='Control Variate'
            labelId='control-variate-label'
            {...register('control_variate')}
            defaultValue={'none'}
          >
            <MenuItem value='none'>None</MenuItem>
            <MenuItem value='geometric'>Geometric</MenuItem>
          </Select>
          {errors.control_variate && <Typography color="error" variant="caption">{errors.control_variate.message}</Typography>}
        </FormControl>
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
            <Typography variant="h6">Arithmetic Basket Option (Monte Carlo)</Typography>
          </Box>

          <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
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
                label={response.input.option_type.toUpperCase() + " OPTION"}
                color={response.input.option_type === 'call' ? "primary" : "secondary"}
                sx={{ fontWeight: 'bold' }}
              />
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
          </Box>

          <Divider />

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
              Input Parameters
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>First Asset Price (S₁)</TableCell>
                  <TableCell align="right">{response.input.S1}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Second Asset Price (S₂)</TableCell>
                  <TableCell align="right">{response.input.S2}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>First Asset Volatility (σ₁)</TableCell>
                  <TableCell align="right">{response.input.sigma1}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Second Asset Volatility (σ₂)</TableCell>
                  <TableCell align="right">{response.input.sigma2}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Risk-Free Rate (r)</TableCell>
                  <TableCell align="right">{response.input.r}</TableCell>
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
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Correlation Coefficient (ρ)</TableCell>
                  <TableCell align="right">{response.input.rho}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Number of Simulations (m)</TableCell>
                  <TableCell align="right">{response.input.m.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Option Type</TableCell>
                  <TableCell align="right" sx={{ textTransform: 'capitalize' }}>
                    {response.input.option_type}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Control Variate</TableCell>
                  <TableCell align="right" sx={{ textTransform: 'capitalize' }}>
                    {response.input.control_variate}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </TableContainer>
      )}
    </Box>
  )
}

export default ArithemeticBasketOption