import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";

import { useMemo, useState } from "react";
import { CreateClothesFormImageStep } from "./create-clothes-form-image-step";
import { CreateClothesFormSubmitStep } from "./create-clother-form-submit-step";
import { CreateClotherEditor } from "./create-clother-editor";

export function CreateClothesForm() {
  const [activeStep, setActiveStep] = useState(0);

  const [image, setImage] = useState<File | null>(null);
  const url = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );

  const header = (
    <DialogHeader className="mb-2">
      <DialogTitle>Добавление вещи</DialogTitle>
    </DialogHeader>
  );

  const getStepComponent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            {header}
            <div className="grow relative">
              <div className="w-full h-full absolute">
                <CreateClothesFormImageStep
                  onImageChange={async (image) => {
                    setImage(image);
                    setActiveStep(1);
                  }}
                />
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <CreateClotherEditor
            url={url}
            image={image}
            onBackClick={() => setActiveStep(activeStep - 1)}
            onNextClick={() => setActiveStep(activeStep + 1)}
            setImage={setImage}
          />
        );
      case 2:
        return (
          <>
            {header}
            <CreateClothesFormSubmitStep
              onBackClick={() => setActiveStep(activeStep - 1)}
              image={image}
              url={url}
            />
          </>
        );
    }
  };

  return (
    <DialogContent className="flex flex-col gap-4 h-[600px] max-sm:h-[400px]">
      {getStepComponent()}
    </DialogContent>
  );
}
