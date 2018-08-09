#include "mgos.h"
#include "mgos_mqtt.h"
#ifdef MGOS_HAVE_WIFI
#include "mgos_wifi.h"
#endif

enum mgos_app_init_result mgos_app_init(void) {
  return MGOS_APP_INIT_SUCCESS;
}
