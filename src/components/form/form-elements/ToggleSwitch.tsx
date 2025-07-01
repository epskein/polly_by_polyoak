import ComponentCard from "../../common/ComponentCard";
import { Switch } from "../switch/Switch";
import Label from "../Label";

export default function ToggleSwitch() {
  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch is now:", checked ? "ON" : "OFF");
  };
  return (
    <ComponentCard title="Toggle switch input">
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="default-switch"
            defaultChecked={true}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="default-switch">Default</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="checked-switch"
            defaultChecked={true}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="checked-switch">Checked</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="disabled-switch" disabled={true} />
          <Label htmlFor="disabled-switch">Disabled</Label>
        </div>
      </div>
    </ComponentCard>
  );
}
