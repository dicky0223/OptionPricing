import { useState } from "react"
import Container from '@mui/material/Container'
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"

import {
  EuropeanOption,
  ImpliedVolatility,
  GeometricAsianOption,
  GeometricBasketOption,
  ArithemeticAsianOption,
  ArithemeticBasketOption,
  AmericanOption,
  KIKOPutOption,
  InterestRateSwap
} from "./component"

const components = [
  {
    label: 'European Option',
    component: <EuropeanOption />
  },
  {
    label: 'Implied Volatility',
    component: <ImpliedVolatility />
  },
  {
    label: 'Geometric Asian Option',
    component: <GeometricAsianOption />
  },
  {
    label: 'Geometric Basket Option',
    component: <GeometricBasketOption />
  },
  {
    label: 'Arithmetic Asian Option',
    component: <ArithemeticAsianOption />
  },
  {
    label: 'Arithmetic Basket Option',
    component: <ArithemeticBasketOption />
  },
  {
    label: 'American Option',
    component: <AmericanOption />
  },
  {
    label: 'KIKO Put Option',
    component: <KIKOPutOption />
  },
  {
    label: 'Interest Rate Swap',
    component: <InterestRateSwap />
  }
]

function App() {
  const [tab, setTab] = useState(0)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <Container sx={{ mt: 4, display: 'flex', gap: 4 }}>
      <Box sx={{ borderRight: 1, borderColor: 'divider' }}>
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
        >
          {
            components.map((component) => (
              <Tab
                label={component.label}
                key={component.label}
                sx={{
                  textTransform: 'none',
                  width: 300,
                  fontSize: 16,
                  fontWeight: 500,
                  paddingY: 4,
                }}
              />
            ))
          }
        </Tabs>
      </Box>

      {components[tab].component}
    </Container>
  )
}

export default App