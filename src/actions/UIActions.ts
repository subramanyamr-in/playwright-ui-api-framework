import { CheckboxActions } from './CheckboxActions.js';
import { DropDownActions } from './DropDownActions.js';
import { InputActions } from './InputActions.js';
import { PageActions } from './PageActions.js';
import { UIElementActions } from './UIElementActions.js';
import { WaitActions } from './WaitActions.js';

/**
 * Unified UI Actions Facade Entry Point.
 *
 * Groups all UI interaction action classes under a single instantiated entrypoint per test session.
 */
export class UIActions {
  /** PageActions instance managing active page and context navigation. */
  public readonly pageActions: PageActions;
  /** High-level mouse, hover, keyboard, and DOM element interaction actions. */
  public readonly element: UIElementActions;
  /** Input field, text population, and file upload actions. */
  public readonly input: InputActions;
  /** Select dropdown option selection and inspection actions. */
  public readonly dropdown: DropDownActions;
  /** Checkbox and radio button state actions. */
  public readonly checkbox: CheckboxActions;
  /** Explicit wait and synchronization actions. */
  public readonly wait: WaitActions;

  /**
   * Initializes a new UIActions facade instance.
   *
   * @param pageActions - Active PageActions instance for current test.
   */
  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
    this.element = new UIElementActions(pageActions);
    this.input = new InputActions(pageActions);
    this.dropdown = new DropDownActions(pageActions);
    this.checkbox = new CheckboxActions(pageActions);
    this.wait = new WaitActions(pageActions);
  }
}
