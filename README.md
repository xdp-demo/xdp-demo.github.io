# xDP: Explaining Differential Privacy

## Dependencies

- Bootstrap 5.0
- p5 1.3.1

## File Structure

### HTML

`index.html`
Contains all html code

### JavaScript

`js/components/` contains p5 components

- `js/components/DPViz.js`
  - Parent root object to manage UserView and SystemView
  - `js/components/SystemView.js`
    - Models information (the distribution that results are sampled from) that is visible to the system but not the users
    - `js/components/DistributionColumn.js` models individual columns in a distribution histogram
  - `js/components/UserView.js`
    - Models information (results of analysis) that is visible to the user
    - `js/components/Sample.js`models a sampled result of an analysis.\*
- `js/components/Boundary.js`
  - Models a boundary that other p5 objects can collide with. Used as the floor where samples drop to.
- `js/components/utils.js`
  - Contains common helper functions and constants used by components
- `js/components/distributions.js`
  - Contains functions to sample and get cdf's from laplace distribution

`js/xdp.js` uses `js/components/` to create new p5 canvases for each section
