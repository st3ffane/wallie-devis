import { DevisPage } from './app.po';

describe('devis App', function() {
  let page: DevisPage;

  beforeEach(() => {
    page = new DevisPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
