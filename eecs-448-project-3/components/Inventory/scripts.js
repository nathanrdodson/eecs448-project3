/*
 * The name of this component
 * Later, to render this component, call:
 * new Inventory(options).render(this.container)
 */

const cols = 10;

/**
 * Draw player inventory
 * @class Inventory
 * @constructor
 * @param options
 * @extends Component
 * @public
 */
class Inventory extends Component {
  /**
   * @type {object} overlay
   * @memberof Inventory
   * @public
   */
  overlay;

  /**
   * @type {object} currentToolbarBlock
   * @memberof Inventory
   * @public
   */
  currentToolbarBlock;

  /**
   * @type {object} currentInventoryBlock
   * @memberof Inventory
   * @public
   */
  #currentInventoryBlock;

  /**
   * @type {Boolean} isOpen
   * @memberof Inventory
   * @public
   */
  isOpen = false;

  /**
   * @type {object} toolbar
   * @memberof Inventory
   * @public
   */
  toolbar;

  /**
   * @async
   * @function render
   * @memberof Inventory
   * @param container Container to render the view within
   */
  async render(container) {
    await super.render(container);

    // TODO: Set event listeners and call callbacks on click
    this.toolbar = document.getElementsByClassName('inventory-toolbar')[0];
    this.toolbar.innerHTML = Array.from(
      { length: cols },
      () => `<button class='cell'></button>`
    ).join('');

    this.overlay = document.getElementsByClassName('inventory-overlay')[0];

    this.container.style.setProperty(
      '--texture-count',
      this.options.texturesCount + 1
    );
    this.container.style.setProperty(
      '--texture-size',
      `${this.options.textureSize}px`
    );

    const grid = this.overlay.getElementsByClassName('inventory-grid')[0];
    grid.style.setProperty('--cols', cols);
    grid.innerHTML = Object.entries(this.options.blocks)
      .map(
        ([blockName, { variations }]) => `<button
          class='cell'
          data-block='${blockName}'
          aria-label='${blockName}'
          style="
            --texture-index: ${variations[0]};
            background-image: url('${this.options.src}');
          "
        ></button>`
      )
      .join('');

    const emptyCellCount =
      cols - (Object.keys(this.options.blocks).length % cols);
    grid.innerHTML += Array.from(
      { length: emptyCellCount },
      () => `<button class='cell'></button>`
    ).join('');

    const handleClick = this.handleCellSelect.bind(this);
    const cells = Array.from(this.container.getElementsByClassName('cell'));
    cells.map((cell) => cell.addEventListener('click', handleClick));
    this.destructors.push(() => {
      cells.map((cell) => cell.removeEventListener('click', handleClick));
    });

    return this;
  }

  /**
   * @function toggleOverlay
   * @memberof Inventory
   */
  toggleOverlay() {
    this.isOpen = !this.isOpen;
    this.overlay.style.display = this.isOpen ? 'flex' : 'none';
    this.deselectInventoryBlock();
  }

  /**
   * @function deselectInventoryBlock
   * @memberof Inventory
   */
  deselectInventoryBlock() {
    this.#currentInventoryBlock?.classList.remove('active');
    this.#currentInventoryBlock = undefined;
  }

  /**
   * @function selectInventoryBlock
   * @memberof Inventory
   * @param cell
   */
  selectInventoryBlock(cell) {
    this.deselectInventoryBlock();
    this.#currentInventoryBlock = cell;
    this.#currentInventoryBlock.classList.add('active');
  }

  /**
   * @function deselectToolbarBlock
   * @memberof Inventory
   */
  deselectToolbarBlock() {
    this.currentToolbarBlock?.classList.remove('active');
    this.currentToolbarBlock = undefined;
  }

  /**
   * @function selectToolbarBlock
   * @memberof Inventory
   * @param cell
   */
  selectToolbarBlock(cell) {
    this.deselectToolbarBlock();
    this.currentToolbarBlock?.classList.remove('active');
    this.currentToolbarBlock = cell;
    this.currentToolbarBlock.classList.add('active');
  }

  /**
   * @function setToolbarBlock
   * @memberof Inventory
   * @param slot
   * @param cell
   */
  setToolbarBlock(slot, cell) {
    slot.style.setProperty(
      '--texture-index',
      cell.style.getPropertyValue('--texture-index')
    );
    slot.style.setProperty(
      'background-image',
      cell.style.getPropertyValue('background-image')
    );
    slot.dataset.block = cell.getAttribute('data-block');
  }

  /**
   * @function handleToolbarSelected
   * @memberof Inventory
   * @param index
   */
  handleToolbarSelected(index) {
    this.handleCellSelect({
      target: this.toolbar.children[index === 0 ? 9 : index - 1],
      path: [this.toolbar],
    });
  }

  /**
   * @function handleCellSelect
   * @memberof Inventory
   * @param {target, path}
   */
  handleCellSelect({ target, path }) {
    const isToolbarCell = path.includes(this.toolbar);

    const block = target.getAttribute('data-block');
    const cellHasBlock = block !== null;

    if (isToolbarCell) {
      if (typeof this.#currentInventoryBlock !== 'undefined')
        this.setToolbarBlock(target, this.#currentInventoryBlock);
      this.selectToolbarBlock(target);
      this.deselectInventoryBlock();
    } else {
      if (cellHasBlock) this.selectInventoryBlock(target);
      else this.deselectInventoryBlock();
    }

    if (DEVELOPMENT)
      console.log(
        `Selected ${block} in the ${isToolbarCell ? 'toolbar' : 'inventory'}`
      );
  }
}
