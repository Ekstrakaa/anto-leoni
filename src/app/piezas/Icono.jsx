import {
  CupSoda, Milk, GlassWater, Coffee, Sandwich, Wheat, Egg, Drumstick, Carrot,
  Salad, CookingPot, Fish, Footprints, Dumbbell, Flame,
  PersonStanding, CircleDot, MoveVertical, MoveHorizontal, Shield, Minus,
  TrendingDown, Zap, Heart, Moon, Sunrise, Sun, CloudSun, CalendarCheck, CalendarClock, CalendarX, Ban, Candy, Croissant, Cookie, Wine, Activity, Home, Trees, Droplet, Droplets, CircleHelp, Pill, Hand, Baby, HeartPulse, ArrowDownToLine, ArrowUpFromLine, Check,
} from 'lucide-react'

/* Iconos por nombre: los datos guardan el nombre, no el componente. */
const MAPA = {
  CupSoda, Milk, GlassWater, Coffee, Sandwich, Wheat, Egg, Drumstick, Carrot,
  Salad, CookingPot, Fish, Footprints, Dumbbell, Flame,
  PersonStanding, CircleDot, MoveVertical, MoveHorizontal, Shield, Minus,
  TrendingDown, Zap, Heart, Moon, Sunrise, Sun, CloudSun, CalendarCheck, CalendarClock, CalendarX, Ban, Candy, Croissant, Cookie, Wine, Activity, Home, Trees, Droplet, Droplets, CircleHelp, Pill, Hand, Baby, HeartPulse, ArrowDownToLine, ArrowUpFromLine, Check,
}

export default function Icono({ nombre, size = 18, ...resto }) {
  const I = MAPA[nombre]
  return I ? <I size={size} {...resto} /> : null
}
