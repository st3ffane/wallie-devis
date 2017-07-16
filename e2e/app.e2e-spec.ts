import { Walliea4Page } from './app.po';

describe('walliea4 App', () => {
  let page: Walliea4Page;

  beforeEach(() => {
    page = new Walliea4Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
