import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { apiPost } from '../util/ApiUtil'

const frequencies = ['1M', '3M', '6M', '12M'] as const
const dayCountConventions = ['30/360', 'ACT/360', 'ACT/365'] as const
const businessDayConventions = ['Following', 'Modified Following', 'Preceding'] as const

const IRSRequestSchema = z.object({
  tradeDate: z.date(),
  effectiveDate: z.date(),
  maturityDate: z.date(),
  notional: z.coerce
    .number({
      invalid_type_error: 'Notional must be a number'
    })
    .positive('Notional must be positive'),
  fixedRate: z.coerce
    .number({
      invalid_type_error: 'Fixed rate must be a number'
    })
    .positive('Fixed rate must be positive'),
  floatSpread: z.coerce
    .number({
      invalid_type_error: 'Float spread must be a number'
    }),
  currency: z.string().min(3).max(3),
  fixedFrequency: z.enum(frequencies),
  floatFrequency: z.enum(frequencies),
  dayCountFixed: z.enum(dayCountConventions),
  dayCountFloat: z.enum(dayCountConventions),
  businessDayConvention: z.enum(businessDayConventions)
})

type IRSRequest = z.infer<typeof IRSRequestSchema>

type Cashflow = {
  date: string
  amount: number
  df: number
}

type IRSResponse = {
  npv: number
  fixed_leg_npv: number
  float_leg_npv: number
  fixed_cashflows: Cashflow[]
  float_cashflows: Cashflow[]
}

const InterestRateSwap = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<IRSRequest>({
    resolver: zodResolver(IRSRequestSchema),
    defaultValues: {
      currency: 'USD',
      fixedFrequency: '6M',
      floatFrequency: '3M',
      dayCountFixed: '30/360',
      dayCountFloat: 'ACT/360',
      businessDayConvention: 'Modified Following'
    }
  })

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<IRSResponse | null>(null)

  const onSubmit = async (data: IRSRequest) => {
    setLoading(true)
    try {
      const res = await apiPost<IRSResponse>('/interest-rate-swap', data)
      setResponse(res)
    } catch (error) {
      setResponse(null)
      console.error("Error in API call", error)
    }
    setLoading(false)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display='flex' flexDirection='column' gap={4} width='100%'>
        <Box display='flex' flexDirection='column' gap={2}>
          <Controller
            name="tradeDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Trade Date"
                {...field}
                slotProps={{
                  textField: {
                    error: !!errors.tradeDate,
                    helperText: errors.tradeDate?.message
                  }
                }}
              />
            )}
          />

          <Controller
            name="effectiveDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Effective Date"
                {...field}
                slotProps={{
                  textField: {
                    error: !!errors.effectiveDate,
                    helperText: errors.effectiveDate?.message
                  }
                }}
              />
            )}
          />

          <Controller
            name="maturityDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Maturity Date"
                {...field}
                slotProps={{
                  textField: {
                    error: !!errors.maturityDate,
                    helperText: errors.maturityDate?.message
                  }
                }}
              />
            )}
          />

          <Controller
            name="notional"
            control={control}
            render={({ field }) => (
              <TextField
                label="Notional"
                {...field}
                error={!!errors.notional}
                helperText={errors.notional?.message}
              />
            )}
          />

          <Controller
            name="fixedRate"
            control={control}
            render={({ field }) => (
              <TextField
                label="Fixed Rate (%)"
                {...field}
                error={!!errors.fixedRate}
                helperText={errors.fixedRate?.message}
              />
            )}
          />

          <Controller
            name="floatSpread"
            control={control}
            render={({ field }) => (
              <TextField
                label="Float Spread (bps)"
                {...field}
                error={!!errors.floatSpread}
                helperText={errors.floatSpread?.message}
              />
            )}
          />

          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <TextField
                label="Currency"
                {...field}
                error={!!errors.currency}
                helperText={errors.currency?.message}
              />
            )}
          />

          <Controller
            name="fixedFrequency"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.fixedFrequency}>
                <InputLabel>Fixed Frequency</InputLabel>
                <Select {...field} label="Fixed Frequency">
                  {frequencies.map(freq => (
                    <MenuItem key={freq} value={freq}>{freq}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="floatFrequency"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.floatFrequency}>
                <InputLabel>Float Frequency</InputLabel>
                <Select {...field} label="Float Frequency">
                  {frequencies.map(freq => (
                    <MenuItem key={freq} value={freq}>{freq}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="dayCountFixed"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.dayCountFixed}>
                <InputLabel>Fixed Day Count</InputLabel>
                <Select {...field} label="Fixed Day Count">
                  {dayCountConventions.map(conv => (
                    <MenuItem key={conv} value={conv}>{conv}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="dayCountFloat"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.dayCountFloat}>
                <InputLabel>Float Day Count</InputLabel>
                <Select {...field} label="Float Day Count">
                  {dayCountConventions.map(conv => (
                    <MenuItem key={conv} value={conv}>{conv}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="businessDayConvention"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.businessDayConvention}>
                <InputLabel>Business Day Convention</InputLabel>
                <Select {...field} label="Business Day Convention">
                  {businessDayConventions.map(conv => (
                    <MenuItem key={conv} value={conv}>{conv}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
          <TableContainer component={Paper} elevation={3}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <Typography variant="h6">Interest Rate Swap Valuation</Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>NPV Summary</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Total NPV</TableCell>
                    <TableCell align="right">{response.npv.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fixed Leg NPV</TableCell>
                    <TableCell align="right">{response.fixed_leg_npv.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Floating Leg NPV</TableCell>
                    <TableCell align="right">{response.float_leg_npv.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Fixed Leg Cashflows</Typography>
              <Table size="small">
                <TableBody>
                  {response.fixed_cashflows.map((cf, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{cf.date}</TableCell>
                      <TableCell align="right">{cf.amount.toFixed(2)}</TableCell>
                      <TableCell align="right">{cf.df.toFixed(6)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Floating Leg Cashflows</Typography>
              <Table size="small">
                <TableBody>
                  {response.float_cashflows.map((cf, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{cf.date}</TableCell>
                      <TableCell align="right">{cf.amount.toFixed(2)}</TableCell>
                      <TableCell align="right">{cf.df.toFixed(6)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </TableContainer>
        )}
      </Box>
    </LocalizationProvider>
  )
}

export default InterestRateSwap