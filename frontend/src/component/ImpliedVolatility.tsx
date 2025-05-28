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

const ImpliedVolatilityRequestSchema = z.object({
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
  T: z.string()
    .trim()
    .nonempty('Time to maturity must not be empty')
    .refine(value => !isNaN(Number(value)), {
      message: 'Time to maturity must be a number'
    })
    .refine(value => Number(value) >= 0, {
      message: 'Time to maturity must be greater than or equal to 0'
    })
    .transform(value => Number(value)),
  r: z.string()
    .trim()
    .nonempty('Risk free rate must not be empty')
    .refine(value => !isNaN(Number(value)), {
      message: 'Risk free rate must be a number'
    })
    .refine(value => Number(value) >= 0, {
      message: 'Risk free rate must be greater than or equal to 0'
    })
    .transform(value => Number(value)),
  option_premium: z.coerce
    .number({
      invalid_type_error: 'Option premium must be a number'
    })
    .positive('Option premium must be positive'),
  q: z.string()
    .trim()
    .nonempty('Repo rate must not be empty')
    .refine(value => !isNaN(Number(value)), {
      message: 'Repo rate must be a number'
    })
    .refine(value => Number(value) >= 0, {
      message: 'Repo rate must be greater than or equal to 0'
    })
    .transform(value => Number(value)),
  option_type: z.enum(['call', 'put'], { message: 'Option type must be either call or put' })
})

type ImpliedVolatilityRequest = z.infer<typeof ImpliedVolatilityRequestSchema>

type ImpliedVolatilityResponse = {
  implied_volatility: number | string,
  input: ImpliedVolatilityRequest
}

const ImpliedVolatility = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ImpliedVolatilityRequest>({
    resolver: zodResolver(ImpliedVolatilityRequestSchema)
  })

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ImpliedVolatilityResponse | null>(null)

  const onSubmit = async (data: ImpliedVolatilityRequest) => {
    setLoading(true)
    console.log("submitted", data)
    try {
      const res = await apiPost<ImpliedVolatilityResponse>('/implied-volatility', data)
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
        <TextField id="spot-price" label="Spot Price" variant="outlined" {...register('S')} error={!!errors.S} helperText={errors.S?.message} />
        <TextField id="strike-price" label="Strike Price" variant="outlined" {...register('K')} error={!!errors.K} helperText={errors.K?.message} />
        <TextField id="time-to-maturity" label="Time to Maturity (years)" variant="outlined" {...register('T')} error={!!errors.T} helperText={errors.T?.message} />
        <TextField id="risk-free-rate" label="Risk Free Rate" variant="outlined" {...register('r')} error={!!errors.r} helperText={errors.r?.message} />
        <TextField id="option-premium" label="Option Premium" variant="outlined" {...register('option_premium')} error={!!errors.option_premium} helperText={errors.option_premium?.message} />
        <TextField id="repo-rate" label="Repo Rate" variant="outlined" {...register('q')} error={!!errors.q} helperText={errors.q?.message} />

        <FormControl>
          <InputLabel id="option-type">Option Type</InputLabel>
          <Select
            id='option-type'
            variant='outlined'
            label='Option Type'
            labelId='option-type'
            {...register('option_type')}
            defaultValue={'call'}
          >
            <MenuItem value='call'>Call</MenuItem>
            <MenuItem value='put'>Put</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Button 
        variant='contained' 
        onClick={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? 'Calculating' : 'Calculate'}
      </Button>

      {response && (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 2 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h6">Implied Volatility</Typography>
          </Box>

          <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
            Volatility
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {typeof response.implied_volatility === 'number' 
                  ? (response.implied_volatility).toFixed(6)
                  : response.implied_volatility}
              </Typography>
              <Chip
                label={response.input.option_type.toUpperCase() + " OPTION"}
                color={response.input.option_type === 'call' ? "primary" : "secondary"}
                sx={{ fontWeight: 'bold' }}
              />
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
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Option Premium</TableCell>
                  <TableCell align="right">{response.input.option_premium}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 'bold' }}>Repo Rate (q)</TableCell>
                  <TableCell align="right">{response.input.q}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </TableContainer>
      )}
    </Box>
  )
}

export default ImpliedVolatility
