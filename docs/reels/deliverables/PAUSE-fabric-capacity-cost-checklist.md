# Fabric capacity cost checklist (PAUSE)

Sources:
- [Pause and resume your Fabric capacity](https://learn.microsoft.com/en-us/fabric/enterprise/pause-resume) (updated Aug 14 2026)
- [Save costs with Fabric capacity reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/fabric-capacity) (updated Sep 30 2026)

1. **Reserved or pay-as-you-go?**
   - A reservation's discount is applied hour by hour. Hours with no usage are lost and don't carry over, so pausing a reserved capacity doesn't lower the bill.
   - Pausing saves money on pay-as-you-go.
2. **Before you pause, look at smoothed usage.** When you pause, the remaining overages and smoothed operations are added up and added to your Azure bill. Check the Capacity Metrics app first.
3. **Throttled right now?** Pausing stops throttling and returns the capacity to a healthy state immediately. That bill from step 2 still applies.
4. **Schedule it.** Use the Azure Automation runbooks for Fabric, or the REST APIs (suspend / resume), so pay-as-you-go capacity is off out of hours.
5. **Right-size before you reserve.** Buy CUs to match average use; smoothing spreads background jobs over 24 hours and interactive ones over 10 minutes. Over-buying means lost hours; under-buying means the rest is billed at pay-as-you-go.
6. **Storage and networking** aren't covered by a reservation; they're billed at pay-as-you-go rates.
7. **Permissions.** Pausing needs an F SKU and the Azure actions `Microsoft.Fabric/capacities/suspend/action` and `.../resume/action`; Microsoft recommends a custom role for these.
