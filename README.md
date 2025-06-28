# Plan

## DB
 - [ ] Save query pages
 - [ ] re-implement the scryfall engine (also enable local card searching)

## Deck builder
 - [ ] save query page with a deck, rerun the queries and detect new card additions

## AI
 - [X] chats are separate like copilot on vscode, you can run multiple queries from one chat or start a new chat with the + button (start with this because it will be easier)
 - [ ] ai can add to queries or pull up a query based on name
 - [X] ai can run local commands
 - [X] prompting space can be toggled between query only | ai
 - [ ] include domain in ai card search + add ability to modify domain

## Autocomplete
 - [X] Add autocomplete when nothing is selected to select an argument
 - [ ] Dynamic suggestions that hide for example silly cards, or restrict creature types by format
 - [ ] Typing @query will start a code block for the name and then the rest of the query

## Linting
 - [ ] fields like order can only appear on base level
 - [ ] certain arguments like t: will only accept from their own

## Search Bar
 - [X] scroll to top button - and scroll to top when a new query is searched
 - [X] loading bar display on how many cards
 - [ ] adjustable card sizes
 - [X] potentially order and display setting dropdowns

## Editor Settings
 - [X] Adjust number of card columns (settings page should be transparent or small so that you can see this as you apply settings)
 - [X] Disable tooltips
 - [X] Disable autocomplete (good for mobile or if you already know everything)
 - [X] Disable info / detail on 
 - [X] Setting to Always hide silly cards (vanguard, unsets, etc.)
 - [ ] Setting for wether ai chat should be restricted by domain when searching

## Bugs
 - [X] is:e-t-b has a space so it fucks up autocomplete
 - [X] query reactivates after doc change
 - [ ] the radix primitives are sloooooow, consider creating new dropdown and tooltip
 - [ ] when tooltip is diabled, cursor snaps when holding down a key and editing order/unique
 - [X] tabautocomplete doesn't work
 - [ ] make scryhover work on mobile
 - [ ] quickly toggling a query and disabling while loading leaves the loading state on
 - [X] queries symbols run away when you scroll down

## Add docs
  Argument explanation
 - game
 - legal
 - type
 - oracle
 - is
 - id
 - kw
 - mana
 - cmc
 - otag
 - set
