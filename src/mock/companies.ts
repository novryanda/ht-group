import { Building2, FileText, BookOpen, Calculator, Receipt } from "lucide-react"

export interface SubMenuItem {
  id: string
  label: string
  icon: any
  href: string
  description?: string
}

export interface Company {
  id: string
  name: string
  shortName: string
  icon: any
  subMenuItems: SubMenuItem[]
  isExpanded?: boolean
}

export const subMenuItems: SubMenuItem[] = [
  {
    id: "tagihan",
    label: "Tagihan",
    icon: FileText,
    href: "/tagihan",
    description: "Bills and Invoices"
  },
  {
    id: "pengajian",
    label: "Pengajian",
    icon: BookOpen,
    href: "/pengajian",
    description: "Religious Studies/Teaching"
  },
  {
    id: "biaya-operasional",
    label: "Biaya Operasional",
    icon: Calculator,
    href: "/biaya-operasional",
    description: "Operational Costs"
  },
  {
    id: "biaya-lain",
    label: "Biaya Lain-lain",
    icon: Receipt,
    href: "/biaya-lain",
    description: "Other Expenses"
  }
]

export const companies: Company[] = [
  {
    id: "husni-tamrin-kerinci",
    name: "PT. HUSNI TAMRIN KERINCI",
    shortName: "HTK",
    icon: Building2,
    subMenuItems: subMenuItems.map(item => ({
      ...item,
      href: `/companies/husni-tamrin-kerinci${item.href}`
    })),
    isExpanded: false
  },
  {
    id: "tuah-andalan-melayu",
    name: "PT. TUAH ANDALAN MELAYU",
    shortName: "TAM",
    icon: Building2,
    subMenuItems: subMenuItems.map(item => ({
      ...item,
      href: `/companies/tuah-andalan-melayu${item.href}`
    })),
    isExpanded: false
  },
  {
    id: "nilo-eng",
    name: "PT. NILO ENG",
    shortName: "NE",
    icon: Building2,
    subMenuItems: subMenuItems.map(item => ({
      ...item,
      href: `/companies/nilo-eng${item.href}`
    })),
    isExpanded: false
  },
  {
    id: "zakiyah-talita-anggun",
    name: "PT. ZAKIYAH TALITA ANGGUN",
    shortName: "ZTA",
    icon: Building2,
    subMenuItems: subMenuItems.map(item => ({
      ...item,
      href: `/companies/zakiyah-talita-anggun${item.href}`
    })),
    isExpanded: false
  }
]

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find(company => company.id === id)
}

export const getCompanyByShortName = (shortName: string): Company | undefined => {
  return companies.find(company => company.shortName === shortName)
}
