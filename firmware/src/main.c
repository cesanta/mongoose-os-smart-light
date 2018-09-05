#include "mgos.h"
#include "mgos_shadow.h"

static bool s_light_on = false;

// When we're connected to the shadow, report our current state.
// This may generate shadow delta on the cloud, and the cloud will push
// it down to us.
static void connected_cb(int ev, void *ev_data, void *userdata) {
  mgos_shadow_updatef(0, "{on: %B}", s_light_on); /* Report status */
  (void) ev;
  (void) ev_data;
  (void) userdata;
}

// Handle shadow delta. We're looking at the {"on": true/false} setting
// in the delta, and set the light GPIO accordingly. When done, report
// the state, which should clear the delta on the cloud.
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
    bool inverted = mgos_sys_config_get_smartlight_inverted();
    mgos_gpio_write(pin, inverted ? !on : on); /* Turn on/off the light */
    mgos_shadow_updatef(0, "{on: %B}", on);    /* Report status */
    s_light_on = on;
    LOG(LL_INFO, ("DELTA applied"));
  }
  (void) ev;
  (void) userdata;
}

enum mgos_app_init_result mgos_app_init(void) {
  mgos_event_add_handler(MGOS_SHADOW_UPDATE_DELTA, delta_cb, NULL);
  mgos_event_add_handler(MGOS_SHADOW_CONNECTED, connected_cb, NULL);
  return MGOS_APP_INIT_SUCCESS;
}
