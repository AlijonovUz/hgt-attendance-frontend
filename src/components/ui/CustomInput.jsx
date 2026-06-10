"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
     InputGroup,
     InputGroupAddon,
     InputGroupInput,
} from "@/components/ui/input-group"

export const CustomInput = React.forwardRef(({
     className = "",
     inputClassName = "",
     addonClassName = "",
     suffixIcon,
     suffixPosition = "right",

     ...props
}, ref) => {

     const addonAlign = suffixPosition === "left" ? "inline-start" : "inline-end"

     return (
          <InputGroup className={className}>
               {suffixIcon && suffixPosition === "left" && (
                    <InputGroupAddon align={addonAlign} className={addonClassName}>
                         {suffixIcon}
                    </InputGroupAddon>
               )}

               <InputGroupInput
                    ref={ref}
                    className={cn(
                         "focus-visible:ring-0 focus-visible:outline-none",
                         inputClassName
                    )}
                    {...props}
               />

               {suffixIcon && suffixPosition === "right" && (
                    <InputGroupAddon align={addonAlign} className={addonClassName}>
                         {suffixIcon}
                    </InputGroupAddon>
               )}
          </InputGroup>
     )
})

CustomInput.displayName = "CustomInput"