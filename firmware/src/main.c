#include "mgos.h"
#include "mgos_shadow.h"

static void delta_cb(int ev, void *ev_data, void *userdata) {
  struct mg_str *delta = (struct mg_str *) ev_data;
  int pin = mgos_sys_config_get_smartlight_pin();
  bool on = false;

  LOG(LL_INFO, ("GOT DELTA: [%.*s]", (int) delta->len, delta->p));

  if (json_scanf(delta->p, delta->len, "{on: %B}", &on) != 1) {
    LOG(LL_ERROR, ("Unexpected delta, looking for {on: true/false}"));
  } else if (!mgos_gpio_set_mode(pin, MGOS_GPIO_MODE_OUTPUT)) {
    LOG(LL_ERROR, ("mgos_gpio_set_mode(%d, GPIO_MODE_OUTPUT)", pin));
  } else {
    mgos_gpio_write(pin, on);               /* Turn on/off the light */
    mgos_shadow_updatef(0, "{on: %B}", on); /* Update reported section */
    LOG(LL_INFO, ("DELTA applied"));
  }
  (void) ev;
  (void) userdata;
}

enum mgos_app_init_result mgos_app_init(void) {
  mgos_event_add_handler(MGOS_SHADOW_UPDATE_DELTA, delta_cb, NULL);
  return MGOS_APP_INIT_SUCCESS;
}
