import { PRICE_LIST } from "../../../../elements/catalog/products/price-list";
import { PRODUCT_DETAILS } from "../../../../elements/catalog/products/product-details";
import { VARIANTS_SELECTORS } from "../../../../elements/catalog/products/variants-selectors";
import { AVAILABLE_CHANNELS_FORM } from "../../../../elements/channels/available-channels-form";
import { BUTTON_SELECTORS } from "../../../../elements/shared/button-selectors";
import { selectChannelVariantInDetailsPage } from "../../channelsPage";
import { fillUpPriceList } from "./priceListComponent";

export function variantsShouldBeVisible({ price }) {
  cy.get(PRODUCT_DETAILS.variantRow).should("be.visible");
  cy.contains(PRODUCT_DETAILS.variantPrice, price);
}

export function createFirstVariant({
  sku,
  warehouseId,
  price,
  attribute,
  quantity = 1
}) {
  cy.get(PRODUCT_DETAILS.addVariantsButton).click();
  cy.get(PRODUCT_DETAILS.addVariantsOptionDialog.optionMultiple).click();
  cy.get(BUTTON_SELECTORS.submit).click();
  cy.get(VARIANTS_SELECTORS.valueContainer)
    .click()
    .contains(attribute)
    .click()
    .get(VARIANTS_SELECTORS.nextButton)
    .click();
  fillUpPriceList(price);
  cy.get(`[name*='${warehouseId}']`)
    .click()
    .get(VARIANTS_SELECTORS.stockInput)
    .type(quantity)
    .get(VARIANTS_SELECTORS.nextButton)
    .click();
  if (sku) {
    cy.get(VARIANTS_SELECTORS.skuInput).type(sku);
  }
  cy.addAliasToGraphRequest("ProductVariantBulkCreate")
    .get(VARIANTS_SELECTORS.nextButton)
    .click()
    .waitForRequestAndCheckIfNoErrors("@ProductVariantBulkCreate")
    .waitForProgressBarToNotBeVisible()
    .get(AVAILABLE_CHANNELS_FORM.menageChannelsButton)
    .should("be.visible");
}

export function createVariant({
  sku,
  warehouseName,
  attributeName,
  price,
  costPrice = price,
  channelName,
  quantity = 10
}) {
  cy.get(PRODUCT_DETAILS.addVariantsButton).click();
  fillUpGeneralVariantInputs({ attributeName, warehouseName, sku });
  cy.get(VARIANTS_SELECTORS.saveButton)
    .click()
    .get(BUTTON_SELECTORS.back)
    .click();
  selectChannelForVariantAndFillUpPrices({
    channelName,
    attributeName,
    price,
    costPrice
  });
}

export function fillUpGeneralVariantInputs({
  attributeName,
  warehouseName,
  sku
}) {
  fillUpVariantAttributeAndSku({ attributeName, sku });
  cy.get(VARIANTS_SELECTORS.addWarehouseButton).click();
  cy.contains(VARIANTS_SELECTORS.warehouseOption, warehouseName).click({
    force: true
  });
  cy.get(VARIANTS_SELECTORS.stockInput).type(quantity);
}

export function fillUpVariantAttributeAndSku({ attributeName, sku }) {
  cy.get(VARIANTS_SELECTORS.attributeSelector)
    .click()
    .get(VARIANTS_SELECTORS.attributeOption)
    .contains(attributeName)
    .click()
    .get(VARIANTS_SELECTORS.skuInputInAddVariant)
    .type(sku);
}

export function selectChannelForVariantAndFillUpPrices({
  channelName,
  attributeName,
  price,
  costPrice = price
}) {
  cy.addAliasToGraphRequest("ProductChannelListingUpdate");
  selectChannelVariantInDetailsPage(channelName, attributeName);
  cy.get(BUTTON_SELECTORS.confirm)
    .click()
    .waitForRequestAndCheckIfNoErrors("@ProductChannelListingUpdate");
  cy.contains(PRODUCT_DETAILS.variantRow, attributeName)
    .click()
    .get(PRICE_LIST.priceInput)
    .type(price)
    .get(PRICE_LIST.costPriceInput)
    .type(costPrice)
    .addAliasToGraphRequest("ProductVariantChannelListingUpdate")
    .get(VARIANTS_SELECTORS.saveButton)
    .click()
    .waitForRequestAndCheckIfNoErrors("@ProductVariantChannelListingUpdate")
    .get(BUTTON_SELECTORS.back)
    .click()
    .waitForProgressBarToNotBeVisible()
    .get(AVAILABLE_CHANNELS_FORM.menageChannelsButton)
    .should("be.visible");
}

export function enablePreorderWithThreshold(threshold) {
  cy.get(VARIANTS_SELECTORS.preorderCheckbox)
    .click()
    .get(VARIANTS_SELECTORS.globalThresholdInput)
    .type(threshold);
}

export function setUpPreorderEndDate(endDate, endTime) {
  cy.get(VARIANTS_SELECTORS.setUpEndDateButton)
    .click()
    .get(VARIANTS_SELECTORS.preorderEndDateInput)
    .type(endDate)
    .get(VARIANTS_SELECTORS.preorderEndTimeInput)
    .type(endTime);
}

export function saveVariant(waitForAlias = "VariantCreate") {
  return cy
    .addAliasToGraphRequest(waitForAlias)
    .get(BUTTON_SELECTORS.confirm)
    .click()
    .waitForRequestAndCheckIfNoErrors(`@${waitForAlias}`);
}
