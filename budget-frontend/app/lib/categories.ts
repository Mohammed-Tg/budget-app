export const INCIME_CATEGORIES = [
    "Gehalt",
    "Bonus",
    "Geldgeschenk",
    "Rückerstattung",
    "Sonstiges Einkommen"
] as const;

export const EXPENSE_CATEGORIES = [
    "Miete",
    "Verträge",
    "Gesundheit",
    "Auto",
    "Freitzeit",
    "Essen",
    "Transport",
    "Bildung",
    "Versicherung",
    "Einkaufen",
    "Sonstiges"
] as const;

export const CATEGORY_MAP = {
    income: INCIME_CATEGORIES,
    expense: EXPENSE_CATEGORIES
} as const;

export type TransactionType = keyof typeof CATEGORY_MAP;
export type IncomeCategory = typeof INCIME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type Category = IncomeCategory | ExpenseCategory;
