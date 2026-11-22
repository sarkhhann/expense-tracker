const addBtn = document.querySelector('.add-btn')
const modalOverlay = document.querySelector('.modal-overlay')
const cancelBtn = document.getElementById('cancel-btn')
const transactionForm = document.getElementById('transaction-form')


const incomeEl = document.querySelector('.income p')
const expenseEl = document.querySelector('.expense p')
const netEl = document.querySelector('.net p')
const transactionsEl = document.querySelector('.transactions p')

const addBudgetBtn = document.querySelector('.add-budget-btn')
const budgetsList = document.querySelector('.budgets-list')


let transactionsArr = JSON.parse(localStorage.getItem('transactions')) || []
let budgetsArr = JSON.parse(localStorage.getItem('budgets')) || []


const budgetModalOverlay = document.querySelector('.budget-modal-overlay')

const budgetCancelBtn = document.querySelector('#budget-cancel-btn')


const budgetForm = document.querySelector('#budget-form')


const transactionsList = document.querySelector('.transactions-list')

const categoryChart = document.querySelector('.charts-section article:nth-child(2) .chart-area')

const trendChart = document.querySelector('.charts-section article:nth-child(1) .chart-area')

const themeBtn = document.querySelector('.theme-btn')

const navLinks = document.querySelectorAll('aside nav a')

const pages = document.querySelectorAll('.page')

const allTransactions = document.querySelector('.all-transactions-list')

const searchInput = document.querySelector('.search-input')

const typeFilter = document.querySelector('.type-filter')

const dateSort = document.querySelector('.date-sort')

const seeAllLink = document.querySelector('.see-all-link')

const fullReportsLink = document.querySelector('.full-reports-link')

const reportMonths = document.querySelector('.report-month')
const reportsContent = document.querySelector('.reports-content')


const currencySelect = document.querySelector('#currency-select')


const currencySymbols = {
    USD: '$',
    EUR: '€',
    AED: 'د.إ',
    AZN: '₼'
}



addBtn.addEventListener('click', () => {

    modalOverlay.classList.add('show')
})

cancelBtn.addEventListener('click', () => {

    modalOverlay.classList.remove('show')
})

themeBtn.addEventListener('click', () => {

    document.body.classList.toggle('dark-mode')

    if(document.body.classList.contains('dark-mode')) {

        themeBtn.textContent = '☀️'

        localStorage.setItem('theme', 'dark')
    }else {

        themeBtn.textContent = '🌙'

        localStorage.setItem('theme', 'light')
    }
})

const savedTheme = localStorage.getItem('theme')

if(savedTheme === 'dark') {

    document.body.classList.add('dark-mode')
    themeBtn.textContent = '☀️'
}else {

    document.body.classList.remove('dark-mode')
    themeBtn.textContent = '🌙'
}

transactionForm.addEventListener('submit', e => {

    e.preventDefault()

    const title = document.querySelector('#title').value.trim()
    const amount = Number(document.querySelector('#amount').value)
    const type = document.querySelector('#type').value
    const category = document.querySelector('#category').value
    const date = document.querySelector('#date').value

    if(!title || !date || !Number.isFinite(amount) || amount <= 0) {

        return
    }

    const transaction = {

        id: crypto.randomUUID(),
        title,
        amount,
        type,
        category,
        date
    }

    transactionsArr.push(transaction)
    localStorage.setItem('transactions', JSON.stringify(transactionsArr))

    refreshUI()
    

    transactionForm.reset()
    modalOverlay.classList.remove('show')
})

const refreshUI = () => {
    renderTransactions()
    applyFilters()
    updateStats()
    renderCategoryChart()
    renderTrendChart()
    renderBudgets()
    reportMonths.dispatchEvent(new Event('change'))
}

const renderTransactions = () => {
    transactionsList.replaceChildren()

    const recentTransactions = [...transactionsArr]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5)

    if (recentTransactions.length === 0) {
        const emptyMsg = document.createElement('p')
        emptyMsg.className = 'empty-message'
        emptyMsg.textContent = 'No recent transactions'
        transactionsList.append(emptyMsg)
        return
    }

    recentTransactions.forEach(arr => {
        const itemDiv = createTransactionItem(arr)
        transactionsList.append(itemDiv)
    })
}


const updateStats = () => {

    const totalIncome = transactionsArr.reduce((a, b) => {

        if(b.type === 'income') {

            return a + b.amount
        }

        return a
    }, 0)

    const totalExpense = transactionsArr.reduce((a, b) => {

        if(b.type === 'expense') {

            return a + b.amount
        }

        return a
    }, 0)

    const netBalance = totalIncome - totalExpense
    const totalCount = transactionsArr.length

    incomeEl.textContent = `${symbol}${totalIncome.toFixed(2)}`
    expenseEl.textContent = `${symbol}${totalExpense.toFixed(2)}`
    netEl.textContent = `${symbol}${netBalance.toFixed(2)}`
    transactionsEl.textContent = totalCount

    
}




const renderCategoryChart  = () => {

    categoryChart.replaceChildren()

    const categoryTotals = {}

    transactionsArr.forEach(arr => {

        if(arr.type === 'expense') {

            categoryTotals[arr.category] = (categoryTotals[arr.category] || 0) + arr.amount
        }
    })

    

    const maxValue = Math.max(...Object.values(categoryTotals))

    Object.entries(categoryTotals).forEach(([category, amount]) => {

        

        const itemDiv = document.createElement('div')
        const spanTag = document.createElement('span')
        const newSpanTag = document.createElement('span')
        const barTrack = document.createElement('div')
        const barFill = document.createElement('div')


        itemDiv.className = 'category-item'

        barTrack.className = 'bar-track'
        barFill.className = 'bar-fill'

        spanTag.textContent = category
        newSpanTag.textContent = ` ${symbol}${amount.toFixed(2)}`


        barTrack.append(barFill)
        itemDiv.append(spanTag, newSpanTag, barTrack)

        categoryChart.append(itemDiv)

        const percentage = maxValue > 0 ? (amount / maxValue) * 100 : 0

        barFill.style.width = `${percentage}%`



        
    })
}

const renderTrendChart = () => {
    
    trendChart.replaceChildren()

    const dailyTotals = {}

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    

    transactionsArr.forEach(arr => {

        if(arr.date.slice(0, 7) !== currentMonth) {
            return
        }

        if(!dailyTotals[arr.date]) {
            dailyTotals[arr.date] = {

                income: 0,
                expense: 0
                
            }
        }

        if(arr.type === 'income') {
            dailyTotals[arr.date].income += arr.amount

        }else if(arr.type === 'expense') {
            dailyTotals[arr.date].expense += arr.amount
        }

    })

    const allAmounts = Object.values(dailyTotals).flatMap(totals => [totals.income, totals.expense])
    const maxValue = Math.max(0, ...allAmounts)

    Object.entries(dailyTotals).sort((a, b) => a[0].localeCompare(b[0])).forEach(([date, totals]) => {

        const dayDiv = document.createElement('div')
        const dateSpan = document.createElement('span')
        const incomeBar = document.createElement('div')
        const expenseBar = document.createElement('div')
        const barsDiv = document.createElement('div')

        barsDiv.className = 'trend-bars'
        dayDiv.className = 'trend-day'
        incomeBar.className = 'income-bar'
        expenseBar.className = 'expense-bar'

        const [year, month, day] = date.split('-')

        const formattedDate  = new Date(

            Number(year),
            Number(month) - 1,
            Number(day)
        ).toLocaleDateString('en-US', {

            month: 'short',
            day: 'numeric'
        })

        dateSpan.textContent = formattedDate

        barsDiv.append(incomeBar, expenseBar)

        dayDiv.append(barsDiv, dateSpan)

        trendChart.append(dayDiv)

        const incomePercentage = maxValue > 0 ? (totals.income / maxValue) * 100 : 0
        const expensePercentage = maxValue > 0 ? (totals.expense / maxValue) * 100 : 0

        incomeBar.style.height = `${incomePercentage}%`
        expenseBar.style.height = `${expensePercentage}%`

    })

    
    
}

navLinks.forEach(link => {

    link.addEventListener('click', e => {

        e.preventDefault()

        const targetText = link.textContent.trim()

        if(targetText === 'Dashboard' || targetText === 'Transactions' || targetText === 'Budgets' || targetText === 'Reports' || targetText === 'Settings') {

            navLinks.forEach(l => l.classList.remove('active'))

            link.classList.add('active')

            pages.forEach(page => {

                page.classList.remove('active-page')
            })

            if(targetText === 'Dashboard') {

                document.querySelector('.dashboard').classList.add('active-page')
                
            }else if(targetText === 'Transactions') {

                document.querySelector('.transactions-page').classList.add('active-page')

            }else if(targetText === 'Budgets') {

                document.querySelector('.budgets-page').classList.add('active-page')

            }else if(targetText === 'Reports') {

                document.querySelector('.reports-page').classList.add('active-page')

            }else if(targetText === 'Settings') {

                document.querySelector('.settings-page').classList.add('active-page')
            }
        }
    })
})

seeAllLink.addEventListener('click', e => {

    e.preventDefault()
    navLinks[1].click()
})

fullReportsLink.addEventListener('click', e => {

    e.preventDefault()
    navLinks[3].click()
})

const applyFilters = () => {

    const searchValue = searchInput.value.trim().toLowerCase()
    const selectValue = typeFilter.value

    const sortValue = dateSort.value

    const filteredValue = transactionsArr.filter(value => {

        const matchesSearch = value.title.toLowerCase().includes(searchValue)

        const matchesType = selectValue === 'all' || value.type === selectValue

        return matchesSearch && matchesType
    })

    const sortedValue = [...filteredValue].sort((a, b) => {

        if(sortValue === 'newest') {

            return new Date(b.date) - new Date(a.date)
        }

        if(sortValue === 'oldest') {

            return new Date(a.date) - new Date(b.date)
        }

        return 0

    })

    renderAllTransactions(sortedValue)
    
}

searchInput.addEventListener('input', applyFilters)
typeFilter.addEventListener('change', applyFilters)
dateSort.addEventListener('change', applyFilters)

const renderAllTransactions = (data = transactionsArr) => {

    allTransactions.replaceChildren()

    if(data.length === 0) {

        const emptyMsg = document.createElement('p')
        emptyMsg.className = 'empty-message'

        emptyMsg.textContent = 'No transactions found'
    
        allTransactions.append(emptyMsg)
        
        return
    }

    data.forEach(arr => {

        const itemDiv = createTransactionItem(arr)

        allTransactions.append(itemDiv)

    })
}


const createTransactionItem = (arr) => {
    const itemDiv = document.createElement('div')
    const infoDiv = document.createElement('div')
    const detailsDiv = document.createElement('div')

    itemDiv.className = 'transaction-item'
    infoDiv.className = 'transaction-info'
    detailsDiv.className = 'transaction-details'

    const strongTitle = document.createElement('strong')
    const spanCategory = document.createElement('span')
    const spanAmount = document.createElement('span')
    const timeTag = document.createElement('time')
    const deleteBtn = document.createElement('button')

    deleteBtn.textContent = 'Delete'
    deleteBtn.className = 'delete-btn'

    strongTitle.textContent = arr.title
    spanCategory.textContent = arr.category

    const [year, month, day] = arr.date.split('-').map(Number)

    const formattedDate = new Date(
        year,
        month - 1,
        day
    ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    timeTag.dateTime = arr.date
    timeTag.textContent = formattedDate

    const sign = arr.type === 'income' ? '+' : '-'
    spanAmount.textContent = `${sign}${symbol}${arr.amount.toFixed(2)}`
    spanAmount.classList.add(arr.type === 'income' ? 'income' : 'expense')

    deleteBtn.addEventListener('click', () => {
        transactionsArr = transactionsArr.filter(a => a.id !== arr.id)
        localStorage.setItem('transactions', JSON.stringify(transactionsArr))

        refreshUI()
    })

    infoDiv.append(strongTitle, spanCategory)
    detailsDiv.append(spanAmount, timeTag, deleteBtn)
    itemDiv.append(infoDiv, detailsDiv)

    return itemDiv 
}

addBudgetBtn.addEventListener('click', () => {

    budgetModalOverlay.classList.add('show')
})

budgetCancelBtn.addEventListener('click', () => {

    budgetModalOverlay.classList.remove('show')
    
})

budgetForm.addEventListener('submit', e => {

    e.preventDefault()

    const category = document.querySelector('#budget-category').value
    const limit = Number(document.querySelector('#budget-limit').value)

    if(!category || !Number.isFinite(limit) || limit <= 0) {

        return
    }

    const budgetIndex = budgetsArr.findIndex(find => find.category === category)

    if(budgetIndex === -1) {
        budgetsArr.push({
            category,
            limit
        })
    }else {
        budgetsArr[budgetIndex].limit = limit
    }

    localStorage.setItem('budgets', JSON.stringify(budgetsArr))
    renderBudgets()

    

    budgetForm.reset()
    budgetModalOverlay.classList.remove('show')
    
})


const renderBudgets = () => {

    budgetsList.replaceChildren()

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    budgetsArr.forEach(arr => {

        const spent = transactionsArr.reduce((a, b) => {

            if(b.type === 'expense' && b.category === arr.category && b.date.slice(0, 7) === currentMonth) {

                return a + b.amount
            }

            return a
        }, 0)

        const percentage = arr.limit > 0 ? (spent / arr.limit) * 100 : 0
        const roundedPercentage = Math.round(percentage)

        const budgetItem = document.createElement('div')
        const limitDiv = document.createElement('div')
        const categoryDiv = document.createElement('div')
        const barTrack = document.createElement('div')
        const barFill = document.createElement('div')
        const usageSpan = document.createElement('span')
        const deleteBtn = document.createElement('button')

        budgetItem.className = 'budget-item'
        limitDiv.className = 'budget-limit'
        categoryDiv.className = 'budget-category'
        barTrack.className = 'budget-bar-track'
        barFill.className = 'budget-bar-fill'
        usageSpan.className = 'budget-usage'
        deleteBtn.className = 'budget-delete-btn'

        if(percentage >= 100) {
            barFill.classList.add('danger')
        }else if(percentage >= 80) {
            barFill.classList.add('warning')
        }

        deleteBtn.textContent = 'Delete'
        categoryDiv.textContent = arr.category
        limitDiv.textContent = `${symbol}${spent.toFixed(2)} / ${symbol}${arr.limit.toFixed(2)}`
        usageSpan.textContent = `${roundedPercentage}% used`

        barFill.style.width = `${Math.min(100, percentage)}%`

        deleteBtn.addEventListener('click', () => {

            budgetsArr = budgetsArr.filter(a => a.category !== arr.category)

            localStorage.setItem('budgets', JSON.stringify(budgetsArr))
            renderBudgets()

        })

        barTrack.append(barFill)
        budgetItem.append(categoryDiv, limitDiv, usageSpan, barTrack, deleteBtn)
        budgetsList.append(budgetItem)

    })
}

reportMonths.addEventListener('change', () => {

    reportsContent.replaceChildren()

    const monthValue = reportMonths.value

    const filterValue = transactionsArr.filter(arr => arr.date.slice(0, 7) === monthValue)


    const totalIncome = filterValue.reduce((a, b) => {

        if(b.type === 'income') {

            return a + b.amount
        }

        return a
    }, 0)

    const totalExpense = filterValue.reduce((a, b) => {

        if(b.type === 'expense') {

            return a + b.amount
        }

        return a
    }, 0)

    const netBalance = totalIncome - totalExpense

    const itemDiv = document.createElement('div')

    const incomeDiv = document.createElement('div')
    const spanIncome = document.createElement('span')
    const incomePTag = document.createElement('p')

    const expenseDiv = document.createElement('div')
    const spanExpense = document.createElement('span')
    const expensePTag = document.createElement('p')

    const netDiv = document.createElement('div')
    const spanBalance = document.createElement('span')
    const balancePTag = document.createElement('p')

    itemDiv.className = 'report-item'
    incomeDiv.className = 'report-income'
    expenseDiv.className = 'report-expense'
    netDiv.className = 'report-net'

    spanIncome.textContent = 'Total Income'
    incomePTag.textContent = `${symbol}${totalIncome.toFixed(2)}`
    spanExpense.textContent = `Total Expense`
    expensePTag.textContent = `${symbol}${totalExpense.toFixed(2)}`
    spanBalance.textContent = 'Net Balance'
    balancePTag.textContent = `${symbol}${netBalance.toFixed(2)}`


    incomeDiv.append(spanIncome, incomePTag)
    expenseDiv.append(spanExpense, expensePTag)
    netDiv.append(spanBalance, balancePTag)

    itemDiv.append(incomeDiv, expenseDiv, netDiv)

    reportsContent.append(itemDiv)
})

currencySelect.addEventListener('change', () => {

    const currencyValue = currencySelect.value

    symbol = currencySymbols[currencyValue]

    localStorage.setItem('currency', currencyValue)

    refreshUI()
})

const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

const savedCurrency = localStorage.getItem('currency') || 'USD'
let symbol = currencySymbols[savedCurrency]
currencySelect.value = savedCurrency

reportMonths.value = currentMonth

refreshUI()



